(function () {
    // 检测url
    if (!window.location.href.startsWith('https://mooc1-1.chaoxing.com/mycourse/studentstudy')) {
        alert('请在"学生学习页面"使用！ 地址为 https://mooc1-1.chaoxing.com/mycourse/studentstudy');
        return;
    };
    // if (window._eryahelper) return;
    window._eryahelper = true;

    // 提醒接口
    var notify = (function () {
        if (!("Notification" in window)) {
            return alert;
        } else if (Notification.permission === "granted") {
            return function (msg) {
                var notification = new Notification('尔雅助手', {
                    body: msg + '\n点击关闭',
                    icon: 'https://github.com/favicon.ico'
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
                            icon: 'https://github.com/favicon.ico'
                        });
                        notification.onclick = function () {
                            notification.close();
                        }
                    }
                }
            });
        }
        $('#mainid > h1').append('<p style="color: red;">显示通知功能需要权限，请允许通知</p>');
        return alert;
    })();

    // 使用img进行跨域请求
    function postAnswer(question, answer, correct) {
        var img = document.createElement("img");
        img.src = "http://localhost:8700/answer?question=" + question + "&answer=" + answer + "&correct=" + correct;
        img.hidden = true;
        document.querySelector("body").appendChild(img);
    }

    // 启动助手
    function start() {
        (function videoListener() {
            setTimeout(function () {
                try {
                    var video = window.frames['iframe'].contentDocument.querySelector('iframe').contentDocument.querySelector('video')
                    video.addEventListener('ended', function () {
                        notify('课程视频播放完毕');
                    });
                    video.addEventListener('pause', function () {
                        setTimeout(function () {
                            if (video.paused)
                                notify('课程视频已暂停');
                        }, 8000);
                    });
                } catch (e) {
                    videoListener()
                }
            }, 1000);
        })();

        
        
        
    }
    $('.content').prepend('<h1 style="text-align:center;font-size:28px;">尔雅助手</h1>');
    $('iframe').on("load", function () {
        console.log(1111)
        start();
        // 共享答案
        try {
            // 嵌套太多iframe了吧...
            var timu = window.frames['iframe'].contentDocument.querySelector('iframe').contentDocument.querySelector('iframe').contentDocument.querySelectorAll('.TiMu');
            $(timu).each(function () {
                var question = $(this).find('.Zy_TItle .clearfix').text().trim();
                var answer = $(this).find('.Py_answer span')[0].innerText.trim().replace('我的答案：', '');
                var correct = $(this).find('.fr').hasClass("dui");
                postAnswer(question, answer, correct);
            });
        }
        catch (e) { }
    })

    
    // 如果切换课程，重新启动助手
    // $('.ncells a').unbind("click").on('click', function(){
    //     console.log(111)
        
    // })

})()