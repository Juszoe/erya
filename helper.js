/**
 * version: 0.93
 * author: Juszoe
 */
(function () {
    // 检测url
    if (window.location.href.search('chaoxing.com/mycourse/studentstudy') == -1) {
        alert('请在"学生学习页面"使用！\n地址为 https://mooc1-1.chaoxing.com/mycourse/studentstudy');
        return;
    };
    if (window._eryahelper) return;
    window._eryahelper = true;

    // 提醒接口
    var notify = (function () {
        if (!("Notification" in window)) {
            return alert;
        } else if (Notification.permission === "granted") {
            return function (msg) {
                var notification = new Notification('尔雅助手', {
                    body: msg + '\n点击关闭\n',
                    icon: 'https://juszoe.github.io/erya/favicon.ico'
                });
                notification.onclick = function () {
                    notification.close();
                }
            }
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                if (permission === "granted") {
                    notify = function (msg) {
                        var notification = new Notification('尔雅助手', {
                            body: msg + '\n(点击关闭)',
                            icon: 'https://juszoe.github.io/erya/favicon.ico'
                        });
                        notification.onclick = function () {
                            notification.close();
                        }
                    }
                }
            });
        }
        $('#helper').append('<p style="color: red;">显示通知功能需要权限，请允许通知</p>');
        return alert;
    })();

    // 使用jsonp进行跨域请求
    function postAnswer(answers) {
        $.ajax({
            url: "https://api.tensor-flow.club:8700/collect",
            type: "GET",
            data: {
                answers: JSON.stringify(answers)
            },
            dataType: "jsonp", //指定服务器返回的数据类型
            success: function (data) {
            }
        });
    }
    function getAnswer(course, keyword, success, error) {
        $.ajax({
            url: "https://api.tensor-flow.club:8700/answer",
            type: "GET",
            data: {
                course: course,
                keyword: keyword
            },
            dataType: "jsonp", //指定服务器返回的数据类型
            success: success,
            error: error
        });
    }

    // 获取课程名
    var course = /courseName:'(.*?)'/.exec(addOrUpdateClazzNote.toString())[1];

    // 公告
    $('.content').prepend('<div id="announce"></div>');
    $.ajax({
        url: "https://api.tensor-flow.club:8700/announce",
        type: "GET",
        dataType: "jsonp", //指定服务器返回的数据类型
        success: function (data) {
            $('#announce').html(data);
        }
    });
    $('.content').prepend('<h1 id="helper" style="text-align:center;font-size:28px;">尔雅助手<a style="color:blue;" href="https://juszoe.github.io/erya" target="_blank">主页</a></h1>');
    if (window.frames['iframe'].contentDocument.readyState == 'complete') {
        start();
    }
    $('iframe').on("load", function () {
        start();
    })

    // 发电区
    $('body').prepend(
        '<div id="erya-sponsor" style="float: left; position: absolute; left: 20px; top: 50px;">' +
        '<button>作者发电区</button>' +
        '<div style="display: none; width： 200px;">' +
        '<p>支持作者，请作者吃顿饭<img src="https://api.tensor-flow.club:8700/static/emoticon.png" width="20px" height="20px"></p>' +
        '<img src="https://api.tensor-flow.club:8700/static/wechatcode.png" width="200px" />' +
        '</div></div>');
    $('#erya-sponsor button').click(function () {
        $('#erya-sponsor div').toggle(200);
    })

    // 启动助手
    function start() {
        // 解除视频限制
        var trycount = 0;
        (function videoListener() {
            setTimeout(function () {
                try {
                    trycount++;
                    var video = window.frames['iframe'].contentDocument.querySelector('iframe').contentDocument.querySelector('video')
                    video.addEventListener('ended', function () {
                        notify('《' + course + '》 课程视频播放完毕');
                    });
                    video.addEventListener('pause', function () {
                        setTimeout(function () {
                            if (video.paused && !video.ended)
                                video.play();
                        }, 100);
                    });
                } catch (e) {
                    if (trycount > 20) return;
                    videoListener()
                }
            }, 1000);
        })();

        // 共享答案
        try {
            // 嵌套太多iframe了吧...
            var timu = window.frames['iframe'].contentDocument.querySelector('iframe').contentDocument.querySelector('iframe').contentDocument.querySelectorAll('.TiMu');
            var result = [];
            $(timu).each(function () {
                var question = $(this).find('.Zy_TItle .clearfix').text().trim().substr(5);
                var option = $(this).find('.Py_answer span')[0].innerText.trim().replace('我的答案：', '');
                var answer;
                if (option == '√' || option == '×') {
                    answer = option;
                } else {
                    answer = [];
                    for (var i = 0; i < option.length; i++) {
                        var taget = {
                            A: 1,
                            B: 2,
                            C: 3,
                            D: 4
                        }
                        answer.push($(this).find('form > ul > li:nth-child(' + taget[option[i]] + ') > a').text());
                    }
                    answer = answer.join(' ');
                }

                var correct = $(this).find('.fr').hasClass("dui");
                result.push({
                    course: course,
                    question: question,
                    answer: answer,
                    correct: correct
                });
            });
            postAnswer(result);
        }
        catch (e) { }

        // 一键查询答案
        try {
            var idocument = window.frames['iframe'].contentDocument.querySelector('iframe').contentDocument.querySelector('iframe').contentDocument;
            var timu = idocument.querySelectorAll('.TiMu');
            if (!$(timu).find('.Py_answer span')[0]) {
                var $button = $('<input type="button" style="float: left; height: 25px; margin: 5px 0px;" value="一键查询" />');
                $button.click(function () {
                    var question = $(this).siblings('.clearfix').text().trim().substr(5);
                    var $answer = $(idocument.querySelector('#answer'));
                    $.ajax({
                        url: "https://api.tensor-flow.club:8700/cx",
                        type: "GET",
                        data: {
                            course: course,
                            question: question
                        },
                        dataType: "jsonp", //指定服务器返回的数据类型
                        success: function (data) {
                            $answer.text('');
                            if (data.length == 0) {
                                $answer.text('未搜索到答案');
                            }
                            for (var i = 0; i < data.length; i++) {
                                var o = data[i]
                                $answer.append('<p>【题目】 ' + o.question + '</p>');
                                $answer.append('<p>【答案】 ' + o.answer + '</p>');
                                $answer.append('<hr style="border:none;border-top: 1px solid #fff;">');
                            }
                        },
                        error: function () {
                            $answer.text('搜索频繁，请稍后再试');
                        }
                    });
                })
                $(timu).find('.Zy_TItle').prepend($button);
            }
        }
        catch (e) { console.log(e) }

        // 划词助手
        try {
            var idocument = window.frames['iframe'].contentDocument.querySelector('iframe').contentDocument.querySelector('iframe').contentDocument;
            var iwindow = window.frames['iframe'].contentDocument.querySelector('iframe').contentDocument.querySelector('iframe').contentWindow;
            $(idocument.querySelector('body')).prepend('<div id="answer" style="border-radius:5px;font-size:16px;background-color:#71AAFF;color:#fff;padding: 5px;">答案区<div>');
            idocument.addEventListener('mouseup', function (e) {
                var text = iwindow.getSelection().toString().trim();
                var $answer = $(idocument.querySelector('#answer'));
                if (text) {
                    $answer.text('正在搜索答案中...');
                    getAnswer(course, text, function (data) {
                        $answer.text('');
                        if (data.length == 0) {
                            $answer.text('未搜索到答案');
                        }
                        for (var i = 0; i < data.length; i++) {
                            var o = data[i]
                            $answer.append('<p>【题目】 ' + o.question + '</p>');
                            $answer.append('<p>【答案】 ' + o.answer + '</p>');
                            $answer.append('<hr style="border:none;border-top: 1px solid #fff;">');
                        }
                    }, function () {
                        $answer.text('搜索频繁，请稍后再试');
                    })
                }
            });
        } catch (e) { }

        // 字幕助手
        try {
            if ($('#erya-subtitle').length == 0) {
                var iwindow = window.frames['iframe'].contentDocument.querySelector('iframe').contentWindow
                var mid = iwindow.config("mid");
                if (mid) {
                    $.get('/richvideo/subtitle?mid=' + mid, function (data) {
                        try {
                            var path = data[0].url.replace('http://cs.ananas.chaoxing.com/support/', '').replace('.srt', '.vtt');
                            $.get('https://cs-ans.chaoxing.com/support/sub/' + path, function (vtt) {
                                try {
                                    vtt = vtt.replace('WEBVTT\n\n', '').split('\n');
                                    window._eryasubtitle = '';
                                    for (var i = 0; i < vtt.length; i += 4) {
                                        if (vtt[i + 1] == undefined) continue;
                                        window._eryasubtitle += vtt[i + 2] + '，';
                                    }
                                    $('#qqqq').append('<input placeholder="输入关键字搜索字幕" id="subtitle-search" type="text" style="border:1px solid gray; border-radius:3px; padding: 5px; width: 260px;" />');
                                    $('#qqqq').append(' 显示字数范围：<select id="erya-search-range"><option value ="20">20</option><option value ="10">10</option><option value ="50">50</option><option value ="100">100</option></select>');
                                    $('#qqqq').append('<div id="erya-subtitle" style="line-height: 150%;"></div>');
                                    $('#subtitle-search').on('compositionend', function (event) {
                                        var keyword = event.target.value;
                                        if (keyword) {
                                            var reg = new RegExp(keyword, 'g');
                                            var copy = window._eryasubtitle.replace(reg, '<span style="background-color: yellow;">' + keyword + '</span>');
                                            var range = $("#erya-search-range option:selected").val();
                                            var reg2 = new RegExp('.{0,' + range + '}' + keyword + '.{0,' + range + '}', 'g');
                                            var result;
                                            while (result = reg2.exec(window._eryasubtitle)) {
                                                var str = result[0].replace(keyword, '<span style="background-color: yellow;">' + keyword + '</span>');
                                                copy = '<p style="font-weight: bold; border-bottom: 1px solid gray;">...' + str + '...</p>' + copy;
                                            }
                                            $('#erya-subtitle').html(copy);
                                        } else {
                                            $('#erya-subtitle').text(window._eryasubtitle);
                                        }
                                    })
                                    $('#erya-subtitle').text(window._eryasubtitle);
                                }
                                catch (e) { }
                            })
                        } catch (e) { }

                    })
                }
            }
        } catch (e) { }

    }

    // 修改原函数
    window.getTeacherAjax = function (courseId, clazzid, chapterId, cpi, chapterVerCode) {
        closeChapterVerificationCode();
        if (courseId == 0 || clazzid == 0 || chapterId == 0) {
            alert("无效的参数！");
            return;
        }
        if (typeof (cpi) == 'undefined') {
            cpi = 0;
        }
        document.getElementById("mainid").innerHTML = "<div style=\"width:32px;height:32px;margin:0 auto;padding:300px 0\"><img src=\"/images/courselist/loading.gif\" /></div>"
        jQuery.post("/mycourse/studentstudyAjax",
            {
                courseId: courseId
                , clazzid: clazzid
                , chapterId: chapterId
                , cpi: cpi
                , verificationcode: chapterVerCode || ''
            },
            function (data) {
                data = data.replace(/(^\s*)|(\s*$)/g, "");
                var doc = document.getElementById("mainid");
                jQuery(doc).html(data);
                $('iframe').on("load", function () {  // 修改原函数，在这里添加了事件
                    start();
                })
                if (data.indexOf('showChapterVerificationCode') > -1) {
                    recordCheckedChapterParam(courseId, clazzid, chapterId, cpi);
                    return;
                }
                document.getElementById("iframe").src = "/knowledge/cards?clazzid=" + clazzid + "&courseid=" + courseId + "&knowledgeid=" + chapterId + "&num=0&ut=s&cpi=55761320&v=20160407-1";
                var el = $('#iframe');
                //var openlockdiv=document.getElementById("openlock");
                if ($("#openlock").length > 0) {
                    var count = document.getElementById("cardcount").value;
                    if (count == 1) {
                        setTimeout('openlockshow();', 2000);
                    }
                }
                if ($("#cur" + chapterId + " .orange01").length > 0) {

                    jQuery.ajax({
                        type: "get",
                        url: "/edit/validatejobcount",
                        data: {
                            courseId: courseId
                            , clazzid: clazzid
                            , nodeid: chapterId
                        },
                    });
                }
                window.ed_reinitIframe = function ed_reinitIframe() {
                    var iframe = el[0];

                    try {
                        var bHeight = iframe.contentWindow.document.body.scrollHeight;
                        var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
                        var height = Math.max(bHeight, dHeight);
                        el.attr('height', height);
                    } catch (ex) { }
                }
                window.setInterval("ed_reinitIframe()", 200);

                var tab = 0;
                if (tab == 3) {
                    getClazzNote(); changePan('3');
                } else if (tab == 2) {
                    getChapterRightDiscuss(); changePan('2');
                } else {
                    changePan('1');
                }
            }

        );
        window.setInterval("setposition()", 200);
        jobflagOperation();
        scroll(0, 0);
    }

})()