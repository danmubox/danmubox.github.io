/*jshint esversion: 6 */

class DanMuTable {

    constructor(tableId, addId, removeId, clearId, executeId, modalId, formId, exec) {

        this.$table = $(tableId);

        // 输入input
        this.$add = $(addId);

        // 按钮
        this.$remove = $(removeId);
        this.$clear = $(clearId);
        this.$execute = $(executeId);
        this.$execute_ing = this.$execute.find("span");

        this.$modal = $(modalId);

        this.$form = $(formId);

        this.initToolbar();
        this.initDrag();
        this.initExecute(exec);

        // 修复表格高度
        Common.fixTableHeight(this.$table);
    }

    initExecute(exec) {

        this.$execute.click(() => {

            this.$form.attr("disabled", true);
            this.$execute_ing.removeClass('d-none');

            exec();
        });
    }

    initToolbar() {

        // 注册表格选中内容变动
        this.$table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table',
            (rows) => {

                const flag = this.$table.bootstrapTable('getSelections').length == 0;

                this.$remove.attr("disabled", flag);
            });

        // 注册表格内容变动
        this.$table.on('reset-view.bs.table', () => {

            // 表中数据为空时
            const flag = this.$table.bootstrapTable('getData').length == 0;

            this.$clear.attr("disabled", flag);
            this.$execute.attr("disabled", flag);
        });

        this.$clear.click(() => this.$table.bootstrapTable('removeAll'));

        this.$remove.click(() => {

            const rows = this.$table.bootstrapTable('getSelections');

            for (let i = 0; i < rows.length; i++) {
                this.$table.bootstrapTable('removeByUniqueId', rows[i].name);
            }

            this.$remove.attr("disabled", true);
        });

        this.$add.on("change", (e) => {

            const addSuccess = this.addSuccess.bind(this);
            const addSuccessAndReadSuccess = this.addSuccessAndReadSuccess.bind(this);

            DanMuResolver.resolveFiles(e.target.files, addSuccess, addSuccessAndReadSuccess);

            this.$add.val(null);
        });
    }

    initDrag() {

        const $modal_drag_content = this.$modal.find(".modal-content");

        // 是否进入h1
        this.enterH1 = false;

        // 拖拽外部文件，进入目标区域触发
        const $modal_drag_content_h1 = $modal_drag_content.find('h1');

        $modal_drag_content_h1.on("dragenter", () => {
            this.enterH1 = true;
            return false;
        });
        $modal_drag_content_h1.on("dragleave", () => {
            this.enterH1 = false;
            return false;
        });
        $modal_drag_content.on("dragenter", () => {
            $modal_drag_content.css("opacity", 1);
            return false;
        });
        $modal_drag_content.on("dragleave", () => {
            if (!this.enterH1) {
                $modal_drag_content.css("opacity", 0.5);
            }
            return false;
        });
        $modal_drag_content.on("dragover", () => {
            return false;
        });
        $modal_drag_content.on("drop", (e) => {

            // 得到拖拽文件列表
            var files = e.originalEvent.dataTransfer.files;

            const addSuccess = this.addSuccess.bind(this);
            const addSuccessAndReadSuccess = this.addSuccessAndReadSuccess.bind(this);

            DanMuResolver.resolveFiles(files, addSuccess, addSuccessAndReadSuccess);

            this.$modal.modal("hide");

            return false;
        });



        // 拖拽外部文件，进入body触发
        $("body").on("dragenter", () => {
            this.$modal.modal("show");
            return false;
        });
        this.$modal.on("dragenter", () => {
            return false;
        });
        this.$modal.on("dragleave", () => {
            if (parseInt($modal_drag_content.css("opacity")) != 1) {
                this.$modal.modal("hide");
            }
            return false;
        });
        this.$modal.on("dragover", () => {
            return false;
        });
        this.$modal.on("drop", () => {
            this.$modal.modal("hide");
            return false;
        });

    }

    /**
     * 执行完毕
     */
    executeComplate(){

        this.$form.attr("disabled", false);
        this.$execute_ing.addClass('d-none');

        // toastr.success("执行完毕！");
    }

    /**
     * 成功添加弹幕文件后的回调
     * 
     * @param {对象} danMu 弹幕
     */
    addSuccess(danMu) {

        // 判断是否已经存在
        const data = this.$table.bootstrapTable('getRowByUniqueId', danMu.name);

        if (data == null) {

            var rows = [];

            rows.push(danMu);

            this.$table.bootstrapTable('append', rows);

        } else {

            toastr.warning("文件：" + danMu.name + "，已在列表中！");
        }
    }

    /**
     * 添加成功，并且读取成功的回调
     * 
     * @param {对象}  danMu 弹幕
     * @param {$对象} $xml 弹幕内容对象
     */
    addSuccessAndReadSuccess(danMu, $xml) {

        DanMuResolver.loadBase(danMu, $xml);

        this.updateData(danMu);
    }

    /**
     * 更新数据
     *
     * @param {对象} danMu 弹幕
     */
    updateData(danMu) {

        this.$table.bootstrapTable('updateByUniqueId', {
            id: danMu.name,
            row: danMu
        });
    }
}