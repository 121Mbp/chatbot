
var CB = {};

CB = {
    settings: {
        name: '',
        imageUri: '',
        region: 'ko',
        platform: '',
        deviceStr: '',
        speed: '',
        isDevice: true,
        rotate: false,
        slider: false,
        database: {
            data: '',
            key: '',
            type: '',
            delay: '',
            hotkey: ''
        },
        element: {
            headerId: '#header',
            wrapperId: '#wrap',
            chatbotId: '#CB',
            containerId: '#container',
            dateClass: '.current-date',
            textareaClass: '.write-text',
            deleteClass: '.btn-delete',
            writeClass: '.write',
            submitClass: '.btn-submit',
            moreClass: '.btn-more',
            messageClass: '.messages',
            msgClass: '.message-text',
            selectClass: '.select-box',
            quickClass: '.quick-item',
            imageClass: '.image-file, .image-thumb',
            layerClass: '.layered',
            closeClass: '.btn-close',
        }
    },
    init: function (initial) {
        var _me = this;

        _me.settings.name = initial.name;
        _me.settings.imageUri = initial.imageUri;
        _me.settings.region = initial.region;
        _me.settings.platform = initial.platform;
        _me.settings.deviceStr = initial.deviceStr;
        _me.settings.isDevice = initial.isDevice;
        _me.settings.speed = initial.slideSpeed;
        _me.date(_me.settings.region);
        _me.write.init();
        _me.onsize();
        _me.message.layered();

        $(window).resize(this.onsize);
    },
    date: function (region) {
        var _el = this.settings.element;

        moment.locale(region);

        $(_el.dateClass).html(moment().format('LL'));
    },
    write: {
        flag: false,
        init: function () {
            var _me = this;

            _me.input();
        },
        input: function () {
            var _me = this,
                _fn = CB.message,
                _el = CB.settings.element;

            $(_el.textareaClass).on('change keydown keyup', autosize);
            $(_el.textareaClass).on('input paste', triggerinput);
            $(_el.deleteClass).on('click', deletehandle);
            $(_el.submitClass).on('click', submithandle);

            function triggerinput() {
                var _me = $(this);

                setTimeout(function () { lengthcheck(_me) }, 10);
            }

            function autosize(e) {
                var _me = $(this);

                if (e.type == 'keyup') lengthcheck(_me);

                setTimeout(function(){
                    CB.write.keypad();
                    _me.css({height: 'auto'}).css({height: _me.prop('scrollHeight') +2});
                }, 0);
            }

            function deletehandle(){
                $(_el.textareaClass).css({height: 'auto'}).val('').focus();
                lengthcheck(_el.textareaClass);
            }

            function submithandle() {
                var _space = $(_el.textareaClass).val().replace(/\s|銆€/gi, '');

                if (_space == '') {
                    $(_el.textareaClass).focus();
                    return false;
                }

                $(_el.writeClass).addClass('write-disable').find(_el.submitClass).prop('disabled', true);
                setTimeout(function () {
                    $(_el.textareaClass).css({ height: 'auto' }).prop('disabled', true);
                }, 60);
                $(_el.deleteClass).hide();
                _fn.toggleUser = true;
            }

            function lengthcheck(element) {
                var _length = $(element).val().length;

                if (_length == 0) {
                    $(_el.writeClass).addClass('write-disable')
                        .find(_el.submitClass).prop('disabled', true);
                    $(_el.deleteClass).hide();
                    if (_fn.toggleUser == false) {
                        //$(_el.messageClass).children().last().remove();
                        _fn.toggleUser = true;
                    }
                } else {
                    $(_el.writeClass).removeClass('write-disable')
                        .find(_el.submitClass).prop('disabled', false);
                    $(_el.deleteClass).show();
                    if (_fn.toggleUser) {
                        //_fn.state.loading.user();
                        _fn.toggleUser = false;
                    }
                };
            }

            _me.focus(_el);
            //_fn.init();
        },
        focus: function (_el) {
            var _me = this;

            //_me.keypad();

            $(_el.textareaClass).focusin(function () {
                _me.destroy();
                //_me.keypad();
            }).focusout(function () {
                _me.inset();
            });

            $(window).scroll(triggerhandle);
            $(_el.messageClass).on('click', triggerhandle);

            $(document).on('touchstart touchend', function (e) {
                switch (e.type) {
                    case 'touchstart': _me.flag = true; break;
                    case 'touchend': _me.flag = false; break;
                }
            });

            function triggerhandle() {
                if (_me.flag) $(_el.textareaClass).trigger('blur');
            }
        },
        keypad: function () {
            var _el = CB.settings.element;

            $(_el.writeClass).css({ height: 'auto' });

            setTimeout(function () {
                var writearea = $(_el.writeClass).height(),
                    t = $(window).scrollTop(),
                    h = window.innerHeight;

                if(CB.settings.platform == 'ios'){
                    $(_el.wrapperId).css({ top: t, height: h - writearea, bottom: writearea });
                }else{
                    $(_el.wrapperId).css({ top: t, bottom: writearea });
                }

                $(_el.writeClass).css({ height: writearea });
                setTimeout(function () {
                    $(_el.wrapperId).scrollTop($(_el.messageClass).height());
                }, 1);
            }, 200);
        },
        inset: function () {
            var _el = CB.settings.element,
                _inset = $(_el.writeClass).find('.write-row');

            _inset.addClass('write-inset');
            setTimeout(function () {
                $(_el.writeClass).css({ height: 'auto' });
                var writearea = $(_el.writeClass).height();
                $(_el.wrapperId).css({ top: 0, height: 'auto', bottom: writearea });
            }, 1)
        },
        destroy: function () {
            var _el = CB.settings.element,
                _inset = $(_el.writeClass).find('.write-row');

            _inset.removeClass('write-inset');
        }
    },
    message: {
        flag: true,
        position: null,
        toggleAi: false,
        toggleUser: true,
        imageUser: false,
        initialization: false,
        state: {
            loading: {
                ai: function () {
                    var _el = CB.settings.element;

                    $(_el.selectClass).hide();

                    var html = '';

                    html += '<div class="message type-bot">';
                    html += '<div class="message-avatar">';
                    html += '<span class="avatar-image"><img src="' + CB.settings.imageUri + '" alt=""></span>';
                    html += '<span class="avatar-name">' + CB.settings.name + '</span>';
                    html += '</div>';
                    html += '<div class="clear">';
                    html += '<p class="message-text sprite">';
                    html += '<span class="loader"><i></i><i></i><i></i></span>';
                    html += '</p>';
                    html += '</div>';
                    html += '</div>';

                    $(_el.messageClass).append(html);
                    setTimeout(function () { $('.loader').addClass('animation') }, 260);
                    CB.write.keypad();

                    return false;
                },
                user: function () {
                    var _el = CB.settings.element;

                    $(_el.selectClass).hide();

                    var html = '';

                    html += '<div class="message type-user">';
                    html += '<div class="clear">';
                    html += '<p class="message-text sprite">';
                    html += '<span class="loader"><i></i><i></i><i></i></span>';
                    html += '</p>';
                    html += '</div>';
                    html += '</div>';

                    $(_el.messageClass).append(html);
                    setTimeout(function () { $('.loader').addClass('animation') }, 260);
                    CB.write.keypad();

                    return false;
                },
            },
            prevent: function () {
                var _el = CB.settings.element;

                $(_el.textareaClass).prop('disabled', true);
                CB.write.destroy();
            },
            unprevent: function () {
                var _el = CB.settings.element;

                $(_el.textareaClass).prop('disabled', false);
                CB.write.inset();
            },
            ai: function (timestamp, responseData, entity) {
                var _el = CB.settings.element;

                var messageCounter = 0;

                function messageLoopTimeout(i) {
                    if (i < responseData.length) {
                        setTimeout(function () {
                            var html = '';

                            if(CB.settings.deviceStr == 'pc'){
                                responseData[i].message = responseData[i].message
                                    // 鞚茧皹鞝� 韮滉犯 觳橂Μ
                                    .replace(/\&/g, '&amp;')
                                    .replace(/\</g, '&lt;')
                                    .replace(/\>/g, '&gt;')
                                    .replace(/\'/g, '&#x27;')
                                    .replace(/\n/g, '<br />')
                                    // Image 韮滉犯 觳橂Μ
                                    .split('[img').join('<img')
                                    .split('img]').join('>')
                                    // B 韮滉犯 觳橂Μ
                                    .split('[b').join('<b>')
                                    .split('b]').join('</b>')
                                    // A 韮滉犯 觳橂Μ
                                    .split('[a-tag-start]').join('<a href="')
                                    .split('[a-tag-close]').join('" target="_blank">')
                                    .split('[a-tag-end]').join('</a>')
                                    // Video 韮滉犯 觳橂Μ
                                    .split('[video-tag-start]').join('<video src="')
                                    .split('[video-tag-close]').join(`" controls width="100%">`)
                                    .split('[video-tag-end]').join('</video>')
                                    // 氅旍嫚鞝€ 鞐瓣舶 韮滉犯
                                    .split('[messenger-tag-start]').join('<span class="messenger-link" ')
                                    .split('[messenger-tag-close]').join('>')
                                    .split('[messenger-tag-end]').join('</span>')
                                    // 韽绊姼 旎煬 韮滉犯 觳橂Μ
                                    .split('[font-red]').join('<font color="ff0000">')
                                    .split('[font-orange]').join('<font color="ffa500">')
                                    .split('[font-blue]').join('<font color="0000ff">')
                                    .split('[font-green]').join('<font color="008000">')
                                    .split('[font-end]').join('</font>');
                            }else{
                                responseData[i].message = responseData[i].message
                                    // 鞚茧皹鞝� 韮滉犯 觳橂Μ
                                    .replace(/\&/g, '&amp;')
                                    .replace(/\</g, '&lt;')
                                    .replace(/\>/g, '&gt;')
                                    .replace(/\'/g, '&#x27;')
                                    .replace(/\n/g, '<br />')
                                    // Image 韮滉犯 觳橂Μ
                                    .split('[img').join('<img')
                                    .split('img]').join('>')
                                    // B 韮滉犯 觳橂Μ
                                    .split('[b').join('<b>')
                                    .split('b]').join('</b>')
                                    // A 韮滉犯 觳橂Μ
                                    .split('[a-tag-start]').join('<a href="c2shub://openbrowser?url=')
                                    .split('[a-tag-close]').join('">')
                                    .split('[a-tag-end]').join('</a>')
                                    // Video 韮滉犯 觳橂Μ
                                    .split('[video-tag-start]').join('<video src="')
                                    .split('[video-tag-close]').join(`" controls width="100%">`)
                                    .split('[video-tag-end]').join('</video>')
                                    // 氅旍嫚鞝€ 鞐瓣舶 韮滉犯
                                    .split('[messenger-tag-start]').join('<span class="messenger-link" ')
                                    .split('[messenger-tag-close]').join('>')
                                    .split('[messenger-tag-end]').join('</span>')
                                    // 韽绊姼 旎煬 韮滉犯 觳橂Μ
                                    .split('[font-red]').join('<font color="ff0000">')
                                    .split('[font-orange]').join('<font color="ffa500">')
                                    .split('[font-blue]').join('<font color="0000ff">')
                                    .split('[font-green]').join('<font color="008000">')
                                    .split('[font-end]').join('</font>');
                            }

                            if (i == responseData.length -1) {
                                html += '<div class="clear">';
                                if(responseData[i].is_next_feedback == 1){
                                    if(i == 0){
                                        html += '<div class="message-text feedback sprite">';
                                    }else{
                                        html += '<div class="message-text feedback">';
                                    }
                                }else{
                                    if(i == 0){
                                        html += '<div class="message-text sprite">';
                                    }else{
                                        html += '<div class="message-text">';
                                    }
                                }
                                html += '<span class="message-msg">' + responseData[i].message + '</span>';
                                html += '<span class="message-date">' + moment(timestamp, 'x').format('LT') + '</span>';
                                if (responseData[i].is_next_feedback == 1) {
                                    html += '<ul class="feedback-item">';
                                    html += '<li><button type="button" class="btn-feedback icon like" data-key="300" feedback-type="like" int_name="'+ responseData[i].int_name +'" int_code="'+ responseData[i].int_code +'" int_id="'+ responseData[i].int_id +'" node_id="'+ responseData[i].node_id +'"></button></li>';
                                    html += '<li><button type="button" class="btn-feedback icon unlike" data-key="301" feedback-type="unlike" int_name="'+ responseData[i].int_name +'" int_code="'+ responseData[i].int_code +'" int_id="'+ responseData[i].int_id +'" node_id="'+ responseData[i].node_id +'"></button></li>';
                                    html += '</ul>';
                                }
                                html += '</div>';
                                html += '</div>';
                            } else {
                                html += '<div class="clear">';
                                if(responseData[i].is_next_feedback == 1){
                                    if(i == 0){
                                        html += '<div class="message-text feedback sprite">';
                                    }else{
                                        html += '<div class="message-text feedback">';
                                    }
                                }else{
                                    if(i == 0){
                                        html += '<div class="message-text sprite">';
                                    }else{
                                        html += '<div class="message-text">';
                                    }
                                }
                                html += '<span class="message-msg">' + responseData[i].message + '</span>';
                                if (responseData[i].is_next_feedback == 1) {
                                    html += '<ul class="feedback-item">';
                                    html += '<li><button type="button" class="btn-feedback icon like" data-key="300" feedback-type="like" int_name="'+ responseData[i].int_name +'" int_code="'+ responseData[i].int_code +'" int_id="'+ responseData[i].int_id +'" node_id="'+ responseData[i].node_id +'"></button></li>';
                                    html += '<li><button type="button" class="btn-feedback icon unlike" data-key="301" feedback-type="unlike" int_name="'+ responseData[i].int_name +'" int_code="'+ responseData[i].int_code +'" int_id="'+ responseData[i].int_id +'" node_id="'+ responseData[i].node_id +'"></button></li>';
                                    html += '</ul>';
                                }
                                html += '</div>';
                                html += '</div>';
                            }

                            if ((1 < responseData.length) && (i < responseData.length - 1)) {
                                html += '<div class="clear">';
                                html += '<p class="message-text">';
                                html += '<span class="loader"><i></i><i></i><i></i></span>';
                                html += '</p>';
                                html += '</div>';
                            }

                            setTimeout(function () {
                                CB.message.state.remove();
                                $(_el.messageClass).find('.message:last').append(html);
                                setTimeout(function () { $('.loader').addClass('animation') }, 260);
                                if (i == responseData.length - 1) {
                                    if (entity == false) CB.message.state.unprevent();
                                }
                                CB.write.keypad();

                                messageCounter++;
                                messageLoopTimeout(messageCounter);
                            }, 260);
                        }, responseData[i].delay);
                    }else if (i == responseData.length) {
                        var _db = CB.settings.database;

                        if (_db.data.length > 0) {
                            CB.message.render(_db.data, _db.key, _db.type, _db.delay, _db.hotkey);

                            _db.data = '';
                        }
                    }
                }
                messageLoopTimeout(messageCounter);

                return false;
            },
            user: function (timestamp, questionData, imageUser, imageCDN, wide, high) {
                var _me = this,
                    _el = CB.settings.element;

                var html = '';

                _me.imageUser = imageUser;

                html += '<div class="message type-user">';
                html += '<div class="clear">';

                if (_me.imageUser) {
                    if (wide >= high) {
                        html += '<p class="message-text image-file image-width">';
                    } else {
                        html += '<p class="message-text image-file image-height">';
                    }
                    html += '<img src="' + questionData + '" alt="" data-image="' + imageCDN + '"/>';
                    html += '<span class="message-date">' + moment(timestamp, 'x').format('LT') + '</span>';
                    html += '</p>';
                } else {
                    questionData = questionData
                        .replace(/\&/g, '&amp;')
                        .replace(/\</g, '&lt;')
                        .replace(/\>/g, '&gt;')
                        // .replace(/\"/g, '&quot;')
                        .replace(/\'/g, '&#x27;')
                        // .replace(/\//g, '&#x2F;')
                        .replace(/\n/g, '<br />')
                        .replace('[img', '<img').replace('img]', '>');

                    html += '<p class="message-text sprite">';
                    html += questionData;
                    html += '<span class="message-date">' + moment(timestamp, 'x').format('LT') + '</span>';
                    html += '</p>';
                }
                html += '</div>';
                html += '</div>';

                $(_el.messageClass).append(html);
                $(_el.textareaClass).val();

                CB.write.keypad();
                //CB.message.layered();

                return false;
            },
            remove: function () {
                var _el = CB.settings.element;

                // $(_el.messageClass).children().last().remove();
                // $(_el.textareaClass).val('');

                $('.loader').each(function () {
                    $(this).parents('.clear').remove();
                    if ($(this).parents('.message-text').hasClass('image-file')) {
                        $(this).parent().parent().parent().remove();
                    }
                });
                $(_el.textareaClass).val('');
                $(_el.writeClass).find('.write-more').show();
                //$(_el.quickClass).remove();
            },
            restart: function () {
                var _me = this,
                    _el = CB.settings.element;

                _me.remove();

                $(_el.selectClass).hide();
                $(_el.shortcutClass).find('.btn-close').click();
                $(_el.writeClass).addClass('write-disable')
                    .find(_el.submitClass).prop('disabled', true);
                $(_el.deleteClass).hide();
            },
            clear: function () {
                var _el = CB.settings.element;

                $(_el.quickClass).remove();
            }
        },
        quick: function (_data, _key, _type, _delay, _hotkey) {
            var _db = CB.settings.database;

            _db.data = _data;
            _db.key = _key;
            _db.type = _type;
            _db.delay = _delay;
            _db.hotkey = _hotkey;
        },
        render: function (_data, _key, _type, _delay, _hotkey) {
            var _me = this,
                _el = CB.settings.element;

            setTimeout(function () {
                if (_hotkey) {
                    CB.message.state.unprevent();
                } else {
                    CB.message.state.prevent();
                    $(_el.textareaClass).blur();
                }
                //CB.write.destroy();

                var html = '';

                html += '<div class="message quick-item">';
                html += '<ul class="quick-inner">';
                for (var i = 0; i < _data.length; i++) {
                    html += '<li class="item">';
                    if (_key[i] == '300') {
                        html += '<button type="button" class="btn-item icon like" data-key="' + _key[i] + '">';
                    } else if (_key[i] == '301') {
                        html += '<button type="button" class="btn-item icon unlike" data-key="' + _key[i] + '">';
                    } else {
                        html += '<button type="button" class="btn-item btn-' + _type[i] + '" data-key="' + _key[i] + '">';
                    }
                    if (_key[i] == 'camera') {
                        if (!CB.settings.isDevice) {
                            html += '<input type="file" name="image" accept=".jpg,.jpeg,.png" capture="camera" />';
                        }
                    } else if (_key[i] == 'image') {
                        if (!CB.settings.isDevice) {
                            html += '<input type="file" name="image" accept=".jpg,.jpeg,.png" />';
                        }
                    }
                    html += _data[i];
                    html += '</button>';
                    html += '</li>';
                }
                html += '</ul>';
                html += '<div class="swiper-button-prev"><i></i></div>';
                html += '<div class="swiper-button-next"><i></i></div>';
                html += '</div>';


                $(_el.messageClass).append(html);
                
                const swiper = new Swiper('.quick-item', {
                    wrapperClass: 'quick-inner',
                    slideClass: 'item',
                    slidesPerView: 'auto',
                    speed: CB.settings.speed,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }
                });

                CB.write.keypad();
            }, _delay * 0.17);
        },
        layered: function () {
            var _me = this,
                _el = CB.settings.element;

            $(document).on('click', _el.imageClass, function () {
                if(CB.settings.deviceStr == 'mobile') {
                    var windowW = $(window).width(),
                        windowH = $(window).height(),
                        nativeH = $(_el.headerId).children('.native').height() || 0,
                        imageUri = $(this).find('img').attr('data-image') || $(this).attr('data-image'),
                        //imageUri = $(this).find('img').attr('src'),
                        imageWidth = null, imageHeight = null;

                    if (_me.flag) {
                        _me.position = $(_el.wrapperId).scrollTop();
                        _me.flag = false;
                    }

                    CB.settings.slider = false;
                    CB.onsize();

                    $(_el.layerClass).show().css({top: nativeH, height: windowH - nativeH});
                    $(_el.layerClass).find('.image-cont, .image-inner').css({height: windowH - nativeH});
                    $(_el.layerClass).find('img').attr('src', imageUri).css({width: '', height: ''});

                    imageWidth = $(this).find('img').width() || $(this).width();
                    imageHeight = $(this).find('img').height() || $(this).height();

                    setTimeout(function () {
                        if (imageWidth > imageHeight) {
                            $(_el.layerClass).find('.image-cont').addClass('align');
                        }

                        if (windowW < $(_el.layerClass).find('img').width()) {
                            $(_el.layerClass).find('.image-cont').removeClass('align').find('img').css({width: 'auto'});
                        }
                        if (windowH < $(_el.layerClass).find('img').height()) {
                            $(_el.layerClass).find('.image-cont').removeClass('align').find('img').css({height: 'auto'});
                        }

                        if (imageWidth > imageHeight) {
                            $(_el.layerClass).find('.image-cont').addClass('horizontal');
                        } else {
                            $(_el.layerClass).find('.image-cont').addClass('vertical');
                        }

                        $(_el.wrapperId).addClass('noscroll');
                    }, 30);

                    $(_el.wrapperId).scrollTop(0, 0);
                }
            });

            $(_el.layerClass).on('click', _el.closeClass, function () {
                $(_el.layerClass).hide();
                $(_el.layerClass).find('img').attr('src', '');
                $(_el.wrapperId).removeClass('noscroll');
                $(_el.layerClass).find('.image-cont').removeClass('horizontal vertical align');
                $(_el.wrapperId).scrollTop(_me.position);

                _me.flag = true;
                CB.settings.slider = true;
            });
        }
    },
    onsize: function () {
        var _el = CB.settings.element,
            _docH = $(window).height(),
            _docW = $(window).width();

        if (_docH > _docW) {
            CB.write.keypad();
            CB.settings.rotate = true;
            if (_docW < 768) $(_el.chatbotId).addClass('portrait');
        } else {
            CB.write.keypad();
            CB.settings.rotate = false;
            $(_el.chatbotId).removeClass('portrait');
        }

        return false;
    }
};