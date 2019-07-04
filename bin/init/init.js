/*jshint esversion: 6 */

function getScriptParameter(name, isDecode) {

    // 获取所有脚本导入标签
    let scripts = Array.from(document.getElementsByTagName('script'));

    // 得到init的脚本标签地址
    let src = scripts.find(it => it.src.indexOf('init/init.js') > -1).src;

    let value = src.match(new RegExp(name + "=([^&]*)"))[1];

    if (isDecode) {
        value = decodeURIComponent(value);
    }

    return value;
}

function bornHtml() {

    let title = getScriptParameter("title", true);

    let item = getScriptParameter("item");

    if (title.length > 0) {
        title = " - " + title;
    }

    function isActive(cur) {
        return item == cur ? "active" : "";
    }

    var html = `
   	<!DOCTYPE html>
	<html lang="zh">
	<head>
	    <title>弹幕盒子${title}</title>
	    <link rel="stylesheet" type="text/css" href="lib/pace-1.0.2/themes/blue/pace-theme-flash.css">
	    <script type="text/javascript" src="lib/pace-1.0.2/pace.min.js"></script>
	    <link rel="icon" href="bin/init/favicon.ico" type="image/x-icon" />
    	<link rel="stylesheet" type="text/css" href="lib/bootstrap-4.3.1/css/bootstrap.min.css">
    	<link rel="stylesheet" type="text/css" href="lib/toastr-2.1.1/toastr.css">
    	<script type="text/javascript" src="lib/jquery-3.4.1/jquery.min.js"></script>
    	<script type="text/javascript" src="lib/jquery-cookie-1.4.1/jquery.cookie.min.js"></script>
    	<script type="text/javascript" src="lib/popper-1.14.7/popper.min.js"></script>
    	<script type="text/javascript" src="lib/bootstrap-4.3.1/js/bootstrap.min.js"></script>
    	<script type="text/javascript" src="lib/toastr-2.1.1/toastr.min.js"></script>
    	<script type="text/javascript" src="lib/clipboard-2.0.4/clipboard.min.js"></script>
    	<script type="text/javascript" src="bin/common/common.min.js"></script>
	</head>

	<body>
	    <nav class="navbar navbar-expand-lg bg-dark navbar-dark">
		    <a class="navbar-brand" href="./">
		        <img src="bin/init/danmubox.png" alt="弹幕盒子">
		    </a>
		    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
		        <span class="navbar-toggler-icon"></span>
		    </button>
		    <div class="collapse navbar-collapse" id="navbarSupportedContent">
		        <ul class="navbar-nav mr-auto">
		            <li class="nav-item">
		                <a class="nav-link ${isActive('home')}" href="./">主页</a>
		            </li>
		            <li class="nav-item">
		                <a class="nav-link ${isActive('search')}" href="search">搜索</a>
		            </li>
		            <li class="nav-item">
		                <a class="nav-link ${isActive('merge')}" href="merge">合并</a>
		            </li>
		            <li class="nav-item">
		                <a class="nav-link ${isActive('convert')}" href="convert">转换</a>
		            </li>
		            <li class="nav-item">
		                <a class="nav-link ${isActive('message')}" href="message">留言板</a>
		            </li>
		            <li class="nav-item">
		                <a class="nav-link ${isActive('about')}" href="about">关于</a>
		            </li>
		        </ul>
		    </div>
		</nav>
		<div class="container center">
			<div class="d-flex justify-content-center">
			  <div class="spinner-border text-primary mt-5 mb-5" role="status">
			    <span class="sr-only">Loading...</span>
			  </div>
			</div>
		</div>
		<footer class="navbar-fixed-bottom">
  			<div class="container">
  				<hr/>
  				<p class="text-secondary">
  					<small>
  						本站不存储任何资源内容。<br/>
  						本站所提供的查询服务，所得结果来源于网络。其内容质量本站无法保证，需用户自行甄别。
  					</small>
  				</p>
  				<p class="text-secondary" style="margin-top:-10px;">
  					<small>
  						©2019 Mr.Po. All rights reserved.
  					</small>
  				</p>
  			</div>
		</footer>
		<script type="text/javascript" src="bin/init/init-callback.min.js"></script>
	</body>
	</html>`;
    return html;
}
document.write(bornHtml());