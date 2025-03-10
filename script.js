(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);

$(function() {
    var isMobile = false;
    if (/mobi/i.test(navigator.userAgent)) {
        isMobile = true;
    }

    var videoHeight = 0,
        hasSlider = false;
        hasVideo = false;
        videoLoaded = false;
        isFullscreenOpen = false,
        player = null;

    var setSliderHeight = function (height) {
        if (!height) {
            return;
        }
        $(".flexslider").height(height);
    };

    if ($("#vidfeat").length) {
        hasVideo = true;
        $(".feature, .inset").fitVids();
        if (!$(".flexslider").length) {
            $('#video-feature').fadeIn(0, function () {
                videoHeight = $('#vidfeat').height();
            });
            videoLoaded = true;
            player = new Vimeo.Player($('#vidfeat')[0]);
        }


        $('.control-play').click(function(event) {
            event.preventDefault();
            if (!videoLoaded) {
                var slider = $('.flexslider').data('flexslider');
                // Hide current slide, which flexslider doesn't do automatically
                $('.slides li').eq(slider.currentSlide).css('opacity', 0);
                var videoSlide = $('<li>'+$('#video-feature').html()+'</li>');
                videoSlide.css('display', 'block');
                slider.addSlide(videoSlide, 0);
                $(".flexslider").flexslider(0);
                $('#video-feature').remove();
                videoLoaded = true;
                player = new Vimeo.Player($('#vidfeat')[0]);
                $(window).resize();
                videoHeight = $('#vidfeat').height();
                setSliderHeight(videoHeight);
                // Trigger resize again in case scrollbar display status changes
                $(window).resize();
            }
            player.play();
        });

        $('.control-pause').click(function(event) {
            event.preventDefault();
            if (player) {
                player.pause();
            }
        });

        if (isMobile) {
            // Only allow fullscreen on iframe for mobile devices
            // For all others, we'll fullscreen its parent when necessary
            $("#vidfeat").attr('allowFullScreen', '');
        }
    }

    $(window).load(function () {
        var slider = initSlider();
        if (!slider) {
            $('.controls, .project-detail').fadeIn(0);
        }
    });

    var shouldResizeImage = function (from, to) {
        return Math.abs(from - to) > 15;
    };

    // Wrap slider in window.load to prevent glitches in image loading delays
    var initSlider = function () {
        var sliderHeight = 0;
        if ($(".flexslider").length && $(".flexslider .slides li").length > 1) {
            hasSlider = true;
            $(".flexslider").flexslider({
                animationSpeed: 0,
                slideshowSpeed: 5000,
                controlNav: false,
                animationLoop: false,
                directionNav: true,
                slideshow: false,
                touch: true,
                start: function () {
                    sliderHeight = $('.slides img').eq(0).height()
                    setSliderHeight(sliderHeight);
                    $('.controls, .project-detail').fadeIn(0);
                },
                before: function (slider) {
                    var withVideo = false;
                    var nextHeight = $('.slides li').eq(slider.animatingTo).height();
                    if (videoLoaded && (slider.animatingTo === 0 || slider.currentSlide === 0)) {
                        if (slider.animatingTo === 0) {
                            nextHeight = videoHeight;
                        }
                        withVideo = true;
                    }
                    // If video is showing, always resize for a perfect player fit
                    if (withVideo || shouldResizeImage(sliderHeight, nextHeight)) {
                        setSliderHeight(nextHeight);
                        sliderHeight = nextHeight;
                    }
                    if (isFullscreenOpen) {
                        if ((videoLoaded && slider.animatingTo === 0)) {
                            closeFullScreen();
                            return;
                        }
                        var image = $('.slides li').eq(slider.animatingTo).find('img');
                        var src = image.data('full-src') || image.data('original-src') || image.attr('src');
                        $('#full-frame img').attr('src', src);
                    }
                }
            });

            $(window).resize($.debounce(450, function () {
                // If video is playing, recalculate video height
                videoHeight = $('#vidfeat').height();
                var activeSlide = $('.flex-active-slide');
                if (activeSlide.find('#vidfeat').length) {
                    sliderHeight = videoHeight;
                } else {
                    sliderHeight = activeSlide.find('img').first().height()
                }
                setSliderHeight(sliderHeight);
            }));

            // Directional controls
            $('.control-prev').click(function (event) {
                event.preventDefault();
                $(".flexslider").flexslider('prev');
            });
            $('.control-next').click(function (event) {
                event.preventDefault();
                $(".flexslider").flexslider('next');
            });
            return true;
        } else if ($('.flexslider').length) {
            $('.flexslider .slides li, .controls, .project-detail').fadeIn(0);
            return true;
        } else {
            return false;
        }
    };

    var closeHandler = function (event) {
        event.preventDefault();
        event.stopPropagation();
        closeFullScreen();
    };

    var openFullScreen = function () {
        isFullscreenOpen = true;
        $('#full-frame-wrapper')
            .fadeIn(0, function () {
                $('body').addClass('full-frame');
            });
        $(window).on('click touchend', closeHandler);
        $(window).on('keydown.full-frame', function(event) {
            if (event.key == "Escape") {
                closeFullScreen();
            }
        })
    };

    var closeFullScreen = function () {
        isFullscreenOpen = false;
        $('body').removeClass('full-frame');
        var wrapper = $('#full-frame');
        wrapper.parent().fadeOut(0);
        wrapper.find('img').off('click touchend');
        $(window).off('click touchend', closeHandler);
        $(window).off('keydown.full-frame');
    };

    $('.flexslider img').click(function (event) {
        event.stopPropagation();
        event.preventDefault();
        var deviceRatio = $(window).width() / $(window).height();
        var imageRatio = $(this).width() / $(this).height();
        // Try to get full size image, which is optimised for full-screen,
        // but fallback to original and large sizes, if not available
        var src = $(this).data('full-src') || $(this).data('original-src') || $(this).attr('src');
        $('#full-frame').find('img').attr('src', src);
        openFullScreen();
    });

    $('#full-frame')
        .find('.full-frame-control')
        .on('click touchend', function (event) {
            if (hasSlider) {
                var slider = $(".flexslider").data('flexslider');
                event.preventDefault();
                event.stopPropagation();
                var offsetX = event.offsetX || event.pageX || (typeof event.originalEvent.touches[0] !== 'undefined' ? event.originalEvent.touches[0].pageX : event.originalEvent.pageX);
                if (offsetX > $(this).width() / 2) {
                    if (slider.currentSlide === slider.last) {
                        closeFullScreen();
                    } else {
                        $(".flexslider").flexslider('next');
                    }
                    return
                }
                if (slider.currentSlide === 0) {
                    closeFullScreen();
                } else {
                    $(".flexslider").flexslider('prev');
                }
            }
        });
});
