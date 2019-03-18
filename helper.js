$(function () {
    (function videoEnded() {
        setTimeout(() => {
            try {
                var video = window.frames['iframe'].contentDocument.querySelector('iframe').contentDocument.querySelector('video')
                video.addEventListener('ended', function () {
                    alert('看完了!!!')
                })
            } catch (e) {
                videoEnded()
            }
        }, 5000);
    })();

})