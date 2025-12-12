/**
 * worklist.include
 * --------------------------------------
 * @version 1.33
 **/

// ------------------------
// InfoSection >> LinkInfo
// ------------------------
function incLinkInfo() {
  var path = "./";
  // var path_ADMIN = 	'../../../ADMIN/html/_ui_guide/';

  var str =
    "" +
    "<table>" +
    "	<caption>Link info</caption>" +
    '	<colgroup><col width="100px" /><col width="auto" /></colgroup>' +
    "	<tbody>" +
    "		<tr>" +
    '			<th scope="row">Work</th>' +
    '			<td class="tobe_section">' +
    '				<a href="' +
    path +
    'worklist.html" class="btn btn_app"><span>App</span></span></a>' +
    '				<a href="' +
    path +
    'worklist.guide.html" class="btn btn_guide"><span>Guide</span></a>' +
    '				<a href="' +
    path +
    'worklist.directory.html" class="btn btn_directory"><span>Dir</span></a>' +
    '				<a href="' +
    path +
    'worklist.todo.html" class="btn btn_todo"><span>Todo</span></a>' +
    "			</td>" +
    "		</tr>" +
    "		<tr>" +
    '			<th scope="row">Util</th>' +
    '			<td class="etc_section">' +
    '				<a href="' +
    path +
    'tools.table.html" class="btn" target="_blank"><span>Data</span></a>' +
    "			</td>" +
    "		</tr>" +
    "	</tbody>" +
    "</table>";
  document.write(str);
}

// ------------------------
// Table >> Thead
// ------------------------
function incThead() {
  var pageType = document.body.getAttribute("data-page");
  var str = "";

  if (pageType == "worklist" || pageType == "app") {
    str =
      "" +
      "<caption>작업 리스트: worklist</caption>" +
      "<colgroup>" +
      '	<col class="num" 				style="width:35px"	 	/> 		<!-- 번호 -->' +
      '	<col class="depth2" 		style="width:10%"		 	/> 		<!-- 2Depth -->' +
      '	<col class="depth3" 		style="width:10%"		 	/> 		<!-- 3Depth -->' +
      '	<col class="depth4" 		style="width:10%"		 	/> 		<!-- 4Depth -->' +
      '	<col class="depth5" 		style="width:10%"		 	/> 		<!-- 5Depth -->' +
      '	<col class="type" 			style="width:80px"		/> 		<!-- Type -->' +
      '	<col class="path" 			style="width:130px"	 	/> 		<!-- 화면 ID -->' +
      '	<col class="page" 			style="width:150px"		 	/> 		<!-- 화면명 -->' +
      '	<col class="corder" 		style="width:80px"		/> 		<!-- 담당자 -->' +
      '	<col class="ddate" 			style="width:80px"		/> 		<!-- 예정일 -->' +
      '	<col class="rdate" 			style="width:80px"		/> 		<!-- 완료일 -->' +
      '	<col class="pdate" 			style="width:80px"		/> 		<!-- 검수대상 -->' +
      '	<col class="mdate" 			style="width:80px"		/> 		<!-- 고객검수 -->' +
      '	<col class="tag" 				style="width:100px"		 	/> 		<!-- Tag -->' +
      '	<col class="log" 				style="width:auto"		/> 		<!-- Log -->' +
      "</colgroup>" +
      "<thead>" +
      "	<tr>" +
      '		<th class="num"  			scope="col">No</th>' +
      '		<th class="depth2"  	scope="col">2Depth</th>' +
      '		<th class="depth3"  	scope="col">3Depth</th>' +
      '		<th class="depth4"  	scope="col">4Depth</th>' +
      '		<th class="depth5"  	scope="col">5Depth</th>' +
      '		<th class="type"  		scope="col">Type</th>' +
      '		<th class="path"  		scope="col">Path</th>' +
      '		<th class="page"  		scope="col">Page</th>' +
      '		<th class="corder"  	scope="col">담당자</th>' +
      '		<th class="ddate"  		scope="col">예정일</th>' +
      '		<th class="rdate"  		scope="col">완료일</th>' +
      '		<th class="pdate"  		scope="col">검수대상</th>' +
      '		<th class="mdate"  		scope="col">고객검수</th>' +
      '		<th class="tag"  			scope="col">Tag</th>' +
      '		<th class="log"  			scope="col">Log</th>' +
      "	</tr>" +
      "</thead>";
  } else if (pageType == "guide") {
    str =
      "" +
      "<caption>작업 리스트: guide</caption>" +
      "<colgroup>" +
      '	<col class="num" 				style="width:3%" 			/> 		<!-- 번호 -->' +
      '	<col class="depth2" 		style="width:11%" 		/> 		<!-- 2Depth -->' +
      '	<col class="depth3" 		style="width:11%" 		/> 		<!-- 3Depth -->' +
      '	<col class="depth4" 		style="width:11%" 		/> 		<!-- 4Depth -->' +
      '	<col class="depth5" 		style="width:11%" 		/> 		<!-- Page -->' +
      '	<col class="path" 			style="width:9%" 			/> 		<!-- 경로 -->' +
      '	<col class="corder" 		style="width:80px" 		/> 		<!-- 담당자 -->' +
      '	<col class="rdate" 			style="width:80px" 		/> 		<!-- Date -->' +
      '	<col class="info" 			style="width:12%" 		/> 		<!-- Info -->' +
      '	<col class="tag" 				style="width:12%" 		/> 		<!-- Tag -->' +
      '	<col class="log" 				style="width:auto" 		/> 		<!-- Log -->' +
      "</colgroup>" +
      "<thead>" +
      "	<tr>" +
      '		<th class="num"				scope="col">No</th>' +
      '		<th class="depth2" 		scope="col">2Depth</th>' +
      '		<th class="depth3" 		scope="col">3Depth</th>' +
      '		<th class="depth4" 		scope="col">4Depth</th>' +
      '		<th class="depth5" 		scope="col">Page</th>' +
      '		<th class="path" 			scope="col">Path</th>' +
      '		<th class="corder" 		scope="col">담당자</th>' +
      '		<th class="rdate" 		scope="col">Date</th>' +
      '		<th class="info" 			scope="col">Info</th>' +
      '		<th class="tag" 			scope="col">Tag</th>' +
      '		<th class="log" 			scope="col">Log</th>' +
      "	</tr>" +
      "</thead>";
  } else if (pageType == "todo") {
    str =
      "" +
      "<caption>작업 리스트: todo</caption>" +
      "<colgroup>" +
      '	<col class="num" 				style="width:35px" 		/> 		<!-- 번호 -->' +
      '	<col class="id" 				style="width:80px" 		/> 		<!-- index -->' +
      '	<col class="depth2" 		style="width:auto" 			/> 		<!-- Cate -->' +
      '	<col class="depth3" 		style="width:25%" 		/> 		<!-- Description -->' +
      '	<col class="path" 			style="width:20%" 		/> 		<!-- path -->' +
      '	<col class="request" 		style="width:80px" 		/> 		<!-- 요청자 -->' +
      '	<col class="corder" 		style="width:80px" 		/> 		<!-- 담당자 -->' +
      '	<col class="ddate" 			style="width:80px" 		/> 		<!-- 요청일 -->' +
      '	<col class="rdate" 			style="width:80px" 		/> 		<!-- 완료일 -->' +
      '	<col class="tag" 				style="width:10%" 		/> 		<!-- Tag -->' +
      '	<col class="log" 				style="width:10%" 		/> 		<!-- Log -->' +
      "</colgroup>" +
      "<thead>" +
      "	<tr>" +
      '		<th class="num"  			scope="col">No</th>' +
      '		<th class="id"  			scope="col">ID</th>' +
      '		<th class="depth2"  	scope="col">Cate</th>' +
      '		<th class="depth3"  	scope="col">Description</th>' +
      '		<th class="path"  		scope="col">Path</th>' +
      '		<th class="request"  	scope="col">요청자</th>' +
      '		<th class="corder"  	scope="col">담당자</th>' +
      '		<th class="ddate"  		scope="col">요청일</th>' +
      '		<th class="rdate"  		scope="col">완료일</th>' +
      '		<th class="tag"  			scope="col">Tag</th>' +
      '		<th class="log"  			scope="col">Log</th>' +
      "	</tr>" +
      "</thead>";
  } else if (pageType == "directory") {
    str =
      "" +
      "<caption>작업 리스트: directory</caption>" +
      "<colgroup>" +
      '	<col class="num" 				style="width:3%" 			/> 		<!-- 번호 -->' +
      '	<col class="depth2" 		style="width:7%" 			/> 		<!-- 2Depth -->' +
      '	<col class="depth3" 		style="width:7%" 			/> 		<!-- 3Depth -->' +
      '	<col class="depth4" 		style="width:7%" 			/> 		<!-- 4Depth -->' +
      '	<col class="depth5" 		style="width:7%" 			/> 		<!-- 5Depth -->' +
      '	<col class="depth6" 		style="width:7%" 			/> 		<!-- 6Depth -->' +
      '	<col class="type" 			style="width:80px" 		/> 		<!-- Type -->' +
      '	<col class="path" 			style="width:120px" 	/> 		<!-- path -->' +
      '	<col class="path2" 			style="width:120px" 	/> 		<!-- path2 -->' +
      '	<col class="corder" 		style="width:80px" 		/> 		<!-- 담당자 -->' +
      '	<col class="rdate" 			style="width:80px" 		/> 		<!-- 작업일 -->' +
      '	<col class="info" 			style="width:15%" 		/> 		<!-- Tag -->' +
      '	<col class="tag" 				style="width:11%" 		/> 		<!-- Tag -->' +
      '	<col class="log" 				style="width:auto" 		/> 		<!-- Log -->' +
      "</colgroup>" +
      "<thead>" +
      "	<tr>" +
      '		<th class="num"  			scope="col">No</th>' +
      '		<th class="depth2"  	scope="col">2Depth</th>' +
      '		<th class="depth3"  	scope="col">3Depth</th>' +
      '		<th class="depth4"  	scope="col">4Depth</th>' +
      '		<th class="depth5"  	scope="col">5Depth</th>' +
      '		<th class="depth6"  	scope="col">6Depth</th>' +
      '		<th class="type"  		scope="col">Type</th>' +
      '		<th class="path"  		scope="col">Path</th>' +
      '		<th class="path2"  		scope="col">Path2</th>' +
      '		<th class="corder"  	scope="col">담당자</th>' +
      '		<th class="rdate"  		scope="col">작업일</th>' +
      '		<th class="info"  		scope="col">Info</th>' +
      '		<th class="tag"  			scope="col">Tag</th>' +
      '		<th class="log"  			scope="col">Log</th>' +
      "	</tr>" +
      "</thead>";
  }

  document.write(str);
}

/**
 * Worklist Setting
 * --------------------------------------
 * 'O': 	Disibled Checked
 * 'X': 	Disibled Unchecked
 * true: 	Enabled Checked
 * false or blank: Enabled Unchecked
 **/
$(document).ready(function () {
  var pageType = document.body.getAttribute("data-page");

  var pageOption = {
    version: "worklist",
    desktop: {
      setting: {
        data: ["O", true, true, true],
        option: [true, true, "X", false],
        //:[No,		2D,		3D,			4D,			5D, 		6D, 		Page, 	Path, 	Type, 	기획, 		디자인,	담당자,	예정,		완료, 		검대상,		고객검,		Tag,		Log
        search: [
          "X",
          "X",
          "X",
          "X",
          "X",
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
        ],
        table: [
          "O",
          "O",
          true,
          true,
          true,
          true,
          "O",
          "O",
          true,
          true,
          true,
          false,
          false,
          true,
          true,
          false,
          true,
          true,
        ],
      },
    },
    mobile: {
      setting: {
        data: ["O", "X", false, false],
        option: [false, true, "X", false],
        //:[No,		2D,		3D,			4D,			5D, 		6D, 		Page, 	Path, 	Type, 	기획, 		디자인,	담당자,	예정,		완료, 		검대상,		고객검,		Tag,		Log
        search: [
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
          "X",
        ],
        table: [
          "O",
          "O",
          true,
          false,
          false,
          false,
          false,
          "O",
          false,
          false,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
        ],
      },
      headerFolding: {
        headerClose: true,
      },
    },
  };

  if (pageType === "worklist.asis") {
    pageOption = {
      version: "worklist.asis",
      desktop: {
        setting: {
          data: ["O", false, true, true],
          option: [true, true, "X", false],
          //:[No,		2D,		3D,			4D,			5D, 		type, 	Path, 	완료, 		Tag,		Log
          search: ["X", "X", "X", "X", "X", true, "X", true, true, true],
          table: ["O", "O", true, true, true, true, "O", true, true, true],
        },
      },
      mobile: {
        setting: {
          data: ["O", "X", false, false],
          option: [false, true, "X", false],
          //:[No,		2D,		3D,			4D,			5D, 			type, 	Path, 	완료, 			Tag,		Log
          search: ["X", "X", "X", "X", "X", "X", "X", "X", "X", true],
          table: ["O", "O", false, false, false, true, "O", false, false, true],
        },
        headerFolding: {
          headerClose: true,
        },
      },
    };
  } else if (pageType === "guide") {
    pageOption = {
      version: "worklist.guide",
      desktop: {
        setting: {
          data: ["O", false, true, true],
          option: [false, true, "X", false],
          //:[No,		2D,			3D,			4D,			page, 	path,		담당자,	Date,		Info,		Tag, 		Log
          search: [
            "X",
            "X",
            "X",
            "X",
            "X",
            "X",
            true,
            true,
            false,
            false,
            true,
          ],
          table: [
            "O",
            "O",
            true,
            true,
            false,
            true,
            true,
            true,
            true,
            false,
            true,
          ],
        },
      },
      mobile: {
        setting: {
          data: ["O", "X", false, false],
          option: [false, true, "X", false],
          //:[No,		2D,			3D,			4D,			page, 	path,		담당자,	Date,		Info,		Tag, 		Log
          search: ["X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X"],
          table: [
            "O",
            "O",
            false,
            false,
            true,
            true,
            false,
            false,
            false,
            false,
            false,
          ],
        },
        headerFolding: {
          headerClose: true,
        },
      },
    };
  } else if (pageType === "todo") {
    pageOption = {
      version: "worklist.todo",
      desktop: {
        setting: {
          data: ["O", false, false, true],
          option: [true, true, "X", true],
          //:[No,		ID,		Cate,		내용,		path,		요청자,	담당자,	요청일, 완료일,  	Tag, 		Log
          search: [
            "X",
            "X",
            "X",
            "X",
            false,
            true,
            true,
            true,
            true,
            true,
            true,
          ],
          table: [
            "O",
            "O",
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
          ],
        },
      },
      mobile: {
        setting: {
          data: ["O", "X", false, false],
          option: [false, true, "X", false],
          //:[No,		ID,		Cate,		내용,		path,  	요청자,	담당자,	요청일, 완료일, 		Tag, 		Log
          search: ["X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X"],
          table: [
            "O",
            "O",
            false,
            false,
            false,
            true,
            false,
            false,
            false,
            false,
            false,
          ],
        },
        headerFolding: {
          headerClose: true,
        },
      },
    };
  } else if (pageType === "directory") {
    pageOption = {
      version: "worklist.directory",
      desktop: {
        setting: {
          data: ["O", false, true, false],
          option: [false, true, "X", false],
          //:[No,		2D,			3D,			4D,			5D, 		6D, 		Type, 	path,		path2,	담당,		완료,		Info, 	Tag, 		Log
          search: [
            "X",
            "X",
            "X",
            "X",
            "X",
            "X",
            true,
            "X",
            "X",
            true,
            true,
            true,
            true,
            true,
          ],
          table: [
            "O",
            "O",
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
          ],
        },
      },
      mobile: {
        setting: {
          data: ["O", "X", false, false],
          option: [false, true, "X", false],
          //:[No,		2D,			3D,			4D,			5D, 		6D, 		Type, 	path,		path2,	담당,		완료,		Info,		Tag, 		Log
          search: [
            "X",
            "X",
            "X",
            "X",
            "X",
            "X",
            "X",
            "X",
            "X",
            "X",
            "X",
            true,
            true,
            true,
          ],
          table: [
            "O",
            "O",
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
          ],
        },
        headerFolding: {
          headerClose: true,
        },
      },
    };
  }

  Worklist.initModule(pageOption);
});
