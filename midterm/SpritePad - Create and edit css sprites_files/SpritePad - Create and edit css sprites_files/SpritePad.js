window.SpritePad = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    Templates: {},
    Objects: {
        init: []
    },
    init: function() {

        $.prototype.put = function(a, b, c) {

            this.ajax(a, b, c);
        }

        _(this.Objects).extend(Backbone.Events);

        _(this.Objects.init).each(function(init) {
            init();
        });

        var ad_height = 154;
        var topbar_height = $('.topbar').height();
        var $body = $('body');
        var $style = $('#styles');
        var $workspace = $('#workspace');

        var body_height = $body.height();
        $(window).bind('resize', function() {
            body_height = $body.height();
            $style.height(body_height - topbar_height - ad_height);
            $workspace.css('max-height', body_height - topbar_height);
        });
        $workspace.css('max-height', body_height - topbar_height);

        if (!localStorage.getItem('did_tour')) {
            setTimeout(function() {
                SpritePad.Objects.tourguide.start();
                localStorage.setItem('did_tour', true)
            }, 2000);
        }
    }
}

SpritePad.Views.AdView = Backbone.View.extend({
    tagName: 'div',
    template: _.template($('#tpl_ad').html()),
    events: {
        "click button": "adclick"
    },
    initialize: function(){
        this.model.bind('change:current', this.render, this);

        this.el.id = 'ad';
        $(this.el).html(this.template(this.model.get('current')));
        this.render();
    },
    render: function(){
        var dta = this.model.get('current'),
            code = this.template(dta),
            _this = this;

        $('*', this.el).fadeOut('slow', function(){
            $(_this.el).html(code);
            $('*', _this.el).fadeIn('slow');
        });
        return this;
    },
    adclick: function(){
        var dta = this.model.get('current');
        piwikTracker.trackPageView('Ad: '+dta.headline);
        dta.action.action();
    }
});
SpritePad.Views.CSSView = Backbone.View.extend({
    tagName: 'div',
    className: 'node',
    template: _.template($('#tpl_css-element').html()),
    events: {
        "click": "doselect"
    },
    initialize: function() {
        this.model.bind('destroy', function(){
            this.remove();
        }, this);

        this.model.bind('change', this.render, this);
        $('#styles').append(this.render().el);

        //Selection Handler
        this.model.bind('select', function() {
            $(this.el).addClass('selected');
        }, this);
        this.model.bind('deselect', function() {
            $(this.el).removeClass('selected');
        }, this);


        //Hover Handler
        var $el = $(this.el);
        this.model.bind('hover:on', function(){
            if(SpritePad.Objects.document.dragmode) return;
            $el.addClass('hover');
        }, this);

        this.model.bind('hover:off', function(){
            $el.removeClass('hover');
        }, this);


        //Hover trigger
        var mod = this.model;
        $(this.el).hover(function(){
            mod.trigger('hover:on');
        }, function(){
            mod.trigger('hover:off');
        });
    },
    render: function() {
        var dta = this.model.toJSON();
        var params = {};

        if(dta.expand == 0){
            var backpos = '';
            if(dta.x) backpos += '-'+dta.x+'px '; else backpos += '0 ';
            if(dta.y) backpos += '-'+dta.y+'px'; else backpos += '0';
            params['background-position'] = backpos;
            params.width = dta.w+'px';
        }
        if(dta.expand == 1){
            if(dta.y){
                params['background-position'] = '0 -'+dta.y+'px';
            } else {
                params['background-position'] = '0 0';
            }
            params['background-repeat'] = 'repeat-x';
        }
        params.height = dta.h+'px';

        dta['properties'] = params;
        

        var html = this.template(dta);
        this.el.innerHTML = html;
        return this;
    },
    doselect: function(e){
        var sel = SpritePad.Objects.document.selection;
        sel.each(function(elm){
           elm.trigger('deselect');
        });
        sel.reset([this.model]);
        this.model.trigger('select');
        SpritePad.Objects.trigger('selection:change');
    }
});
SpritePad.Views.DocumentView = Backbone.View.extend({
    tagName: 'div',
    className: 'excanvas',
    model: SpritePad.Models.DocumentModel,
    template: _.template($('#tpl_document').html()),
    events: {
        "dragover": "nullfunc",
        "dragenter": "nullfunc",
        "dragexit": "nullfunc",
        "drop": "dropfunc",
        "mousedown": "mousedown",
        "mousemove": "mousemove"
    },
    initialize: function() {
        this.model.bind('new_element', this.addElementView);
        this.model.bind('change:width', this.render, this);
        this.model.bind('change:height', this.render, this);
        this.model.bind('click', this.clickhandler, this);
        this.model.draginfo = null;
        $(this.el).html(this.template());

        var el = this.el;
        $('#scale', el)
            .css('cursor', 'nw-resize')
            .on('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();

                $('#workspace')
                    .append('<div id="sdisplay"><b></b></div>')
                    .css('cursor', 'nw-resize')
                    .on('mousemove', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var c = $(el).offset();
                    $('#sdisplay').css({
                        top: c.top+10,
                        left: c.left+10
                    });
                    var x = ~~(e.pageX - c.left - 20);
                    var y = ~~(e.pageY - c.top - 20);
                    $('#sdisplay').css({
                        width: x,
                        height: y
                    })
                        .children('b').text(x + 'x' + y);
                })
            .on('mouseup',
                    function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $('#workspace').off('mousemove, mouseup').css('cursor', 'inherit');
                        var s = $('#sdisplay');
                        SpritePad.Objects.document.resize(s.width(), s.height());
                        s.remove();
                    });

            });
    },
    render: function() {
        var $canvas = $(this.el).children('.canvas');
        if ($canvas.size() == 0) {
            $canvas = $('<div class="canvas"></div>');
            $(this.el).append($canvas);
        }

        $canvas.css({
            width: this.model.get('width'),
            height: this.model.get('height')
        });

        return this;
    },
    /**
     * Drag events should be triggered on a) every selected object b) the drag initiator object
     * @param event
     * @param data
     */
    trigger_on_targets: function(event, data) {
        var mod = this.model,
            sel = mod.selection,
            caller = mod.caller;

        if (sel.length) {
            sel.each(function(obj) {
                obj.trigger(event, data);
            });
            return;
        }

        if (mod.caller) caller.trigger(event, data);
    },
    mousedown: function(e) {
        var offs = $('.canvas', this.el).offset(),
            mod = this.model;
        if (!mod.dragmode) mod.dragmode = 'select';
        mod.dragged = false;
        mod.draginfo = {
            offset: {
                x: offs.left,
                y: offs.top
            },
            constraint: {
                x: this.model.get('width'),
                y: this.model.get('height')
            },
            source: {
                x: e.originalEvent.clientX - offs.left,
                y: e.originalEvent.clientY - offs.top
            },
            destination: {
                x: e.originalEvent.clientX - offs.left,
                y: e.originalEvent.clientY - offs.top
            }
        }

        var _this = this;
        $('body').one('mouseup', function(e) {
            var mod = _this.model;
            if (mod.dragged) {
                mod.trigger('dragend:' + mod.dragmode, mod.draginfo);
            } else {
                mod.trigger('click', {event: e, caller: mod.caller});
            }
            mod.dragmode = '';
            mod.dragged = false;
            mod.draginfo = null;
            mod.caller = null;
        });
    },
    mousemove: function(e) {
        var mod = this.model;
        if (mod.draginfo === null) return;
        var drag_offset = mod.draginfo.offset;

        mod.draginfo.destination = {
            x: e.originalEvent.clientX - drag_offset.x,
            y: e.originalEvent.clientY - drag_offset.y
        }
        mod.draginfo.delta = {
            x: mod.draginfo.destination.x - mod.draginfo.source.x,
            y: mod.draginfo.destination.y - mod.draginfo.source.y
        }
        if (!mod.dragged) {
            mod.dragged = true;
            mod.trigger('dragstart:' + mod.dragmode, mod.draginfo);
            this.trigger_on_targets('dragstart:' + mod.dragmode, mod.draginfo);
        }
        mod.trigger('drag:' + mod.dragmode, mod.draginfo);
        this.trigger_on_targets('drag:' + mod.dragmode, mod.draginfo);

        /*var drag = this.model.get('drag');
         if (drag === null) return;

         var offs = $('.canvas', this.el).offset();

         var xPos = e.originalEvent.clientX - offs.left - drag.offset.x,
         yPos = e.originalEvent.clientY - offs.top - drag.offset.y,
         w = drag.model.get('w'),
         h = drag.model.get('h'),
         dimW = this.model.get('width'),
         dimH = this.model.get('height');

         if (xPos + w > dimW) xPos = dimW - w;
         if (yPos + h > dimH) yPos = dimH - h;
         if (xPos < 0) xPos = 0;
         if (yPos < 0) yPos = 0;

         drag.model.set({
         x: xPos,
         y: yPos
         });*/
    },
    nullfunc: function(e) {
        e.preventDefault();
        e.stopPropagation();
    },
    dropfunc: function(e) {
        var files = e.originalEvent.dataTransfer.files,
            len = files.length,
            file,
            $target = $(e.target),
            xPos = Math.floor(e.originalEvent.clientX - $target.offset().left),
            yPos = Math.floor(e.originalEvent.clientY - $target.offset().top),
            classname;

        this.nullfunc(e);

        for (var i = 0; i < len; i += 1) {
            file = files[i];
            classname = file.name.split('.');
            classname.pop();
            classname = classname.join('.').replace(/ /, '-');
            if(classname.search(/^\d/) != -1){ //CSS classnames must not start with a number.
                classname = 's-' + classname;
            }

            this.model.addElement({
                name: classname,
                imagedata: file,
                x: xPos,
                y: yPos
            });
        }
    },
    clickhandler: function(e) {
        var obj = e.caller,
            shiftKey = e.event.shiftKey,
            sel = this.model.selection,
            doc = SpritePad.Objects;


        if (shiftKey) {
            if (!obj) return;
            if (sel.include(obj)) {
                sel.remove(obj);
                obj.trigger('deselect');
                doc.trigger('selection:change');

            } else {
                sel.add(obj);
                obj.trigger('select');
                doc.trigger('selection:change');
            }
            return;
        }

        if (!obj) {
            if (sel.length) {
                sel.each(function(elm) {
                    elm.trigger('deselect');
                });
                sel.reset();
                doc.trigger('selection:change');
            }
            return;
        }

        var found = false;
        sel.each(function(elm) {
            if (!_(elm).isEqual(obj)) {
                elm.trigger('deselect');
            } else {
                found = true;
            }
        });
        sel.reset([obj]);
        if (!found) obj.trigger('select');
        doc.trigger('selection:change');
    },
    addElementView: function(element) {
        $('.canvas', this.el).append(element);
    },
    /*mousedown: function(){
     var selection = SpritePad.Objects.document.selection;
     if(selection.length){
     selection.each(function(element){
     element.trigger('deselect');
     });
     }
     selection.reset();
     SpritePad.Objects.trigger('selection:change');
     },*/
    dragstart: function(data) {
        if (this.model.selection.length) {
            var e = data.e;
            data = [];
            this.model.selection.each(function(element) {
                $target = $(e.target);
                data.push({
                    model: element,
                    offset: {
                        x: e.originalEvent.clientX - $target.offset().left,
                        y: e.originalEvent.clientY - $target.offset().top
                    }
                });
            });
        } else {
            data = [data];
        }

        _(data).each(function(element) {
            element.origin = {
                x: element.model.get('x'),
                y: element.model.get('y')
            }
        });

        this.model.set({
            drag: data
        });
    },
    dragend: function(e) {
        var drag = this.model.get('drag');
        if (drag) {
            var dta = drag.model.toJSON();

            if (dta.x == drag.origin.x && dta.y == drag.origin.y) {
                var selection = SpritePad.Objects.document.selection;
                //The object has not moved. Consider this as a click.
                if (e.shiftKey) {
                    //Shift has been pressed. Either add or remove this element from the selection list.
                    if (selection.include(drag.model)) {
                        //Element is there - remove it.
                        selection.remove(drag.model);
                        drag.model.trigger('deselect');
                    } else {
                        //Element not jet in the selection. Select it.
                        selection.add(drag.model);
                        drag.model.trigger('select');
                    }
                } else {
                    //No shift key pressed - replace the selection.
                    var found = false;
                    selection.each(function(element) {
                        if (_(element.toJSON()).isEqual(drag.model.toJSON())) {
                            found = true;
                            return;
                        }
                        ;
                        element.trigger('deselect');
                    });
                    selection.reset([drag.model]);
                    if (!found) drag.model.trigger('select');
                }
                SpritePad.Objects.trigger('selection:change');
            }
        }

        this.model.set({
            drag: null
        });
    }
});
SpritePad.Views.ElementView = Backbone.View.extend({
    tagName: 'div',
    className: 'element',
    events: {
        "mousedown": "mousedown"
    },
    initialize: function() {
        this.model.bind('change', this.render, this);

        //Selection Handler
        this.model.bind('select', function() {
            $(this.el).addClass('selected');
        }, this);
        this.model.bind('deselect', function() {
            $(this.el).removeClass('selected');
        }, this);


        //Hover Handler
        var $el = $(this.el);
        this.model.bind('hover:on', function() {
            if(SpritePad.Objects.document.dragmode) return;
            $el.addClass('hover');
        }, this);

        this.model.bind('hover:off', function() {
            $el.removeClass('hover');
        }, this);


        //Hover trigger
        var mod = this.model;
        $(this.el).hover(function() {
            mod.trigger('hover:on');
        }, function() {
            mod.trigger('hover:off');
        });

        //Listen to document resizes
        SpritePad.Objects.bind('document:resized', function(dimensions){
            var repeat = this.model.get('expand');
            if(repeat == 0) return;

            this.render();
        }, this);
    },
    render: function() {
        var dta = this.model.toJSON();
        dta.backgroundRepeat = 'no-repeat';

        if (dta.expand == 1) {
            dta.x = 0;
            dta.w = SpritePad.Objects.document.get('width');
            dta.backgroundRepeat = 'repeat-x';
        }

        this.el.style.top = dta.y + 'px';
        this.el.style.left = dta.x + 'px';
        this.el.style.width = dta.w + 'px';
        this.el.style.height = dta.h + 'px';
        this.el.style.backgroundRepeat = dta.backgroundRepeat;

        if (!this.first_render) {
            var image = dta.imagedata;
            if (typeof image === 'string') {
                this.el.style.backgroundImage = 'url(' + image + ')';
            } else {
                image = dta.imagehash;
                this.el.style.backgroundImage = 'url(api/cache/' + image + ')';
            }
            this.first_render = true;
        }
        return this;
    },
    mousedown: function(e) {
        var $target = $(e.target);
        SpritePad.Objects.document.dragmode = 'element';
        SpritePad.Objects.document.caller = this.model;
        /*{
         model: this.model,
         offset: {
         x: e.originalEvent.clientX - $target.offset().left,
         y: e.originalEvent.clientY - $target.offset().top
         },
         e: e
         };*/
    }
});
SpritePad.Views.filenameView = Backbone.View.extend({
    tagName: 'input',
    events:{
        'keyup': 'change'
    },
    initialize: function(){
        var _this = this;
        this.el.type = 'text';

        SpritePad.Objects.files.bind('selected', function(item){
            _this.el.value = item.get('title');
        });
    },
    change: function(){
        SpritePad.Objects.files.selected.set({
            'title': this.el.value
        });
    }
});
SpritePad.Views.FileStatusView = Backbone.View.extend({
    model: SpritePad.Models.FileStatus,
    template: _.template($('#tpl_file-status').html()),
    initialize: function() {
        this.model.bind('change:target', this.render, this);
    },
    render: function() {
        var target = this.model.get('target');
        $el = $(this.el);
        if (target === null) {
            $el.slideUp();
            return this;
        }
        $el.html(this.template(target.toJSON()));
        $el.slideDown();
        return this;
    }
});
SpritePad.GuideView = Backbone.View.extend({
    model: SpritePad.Models.GuideModel,
    tagName: 'div',
    className: 'guide',
    initialize: function() {
        this.model.bind('change', this.render, this);
    },
    render: function() {
        var st = this.el.style;
        if (this.model.get('type')) {
            st.cursor = 'n-resize';
            st.left = 0;
            st.right = 0;
            st.bottom = 'auto';
            st.width = '1px';
            st.height = 'auto';
            st.top = this.model.get('pos');
        } else {
            st.cursor = 'e-resize';
            st.top = 0;
            st.bottom = 0;
            st.right = 'auto';
            st.width = 'auto';
            st.height = '1px';
            st.left = this.model.get('pos');
        }
        return this;
    }
});
SpritePad.Views.MenuItemView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#tpl_menu-template').html()),
    events: {
        'click': 'dispatch',
        'mouseover': 'mouseover',
        'mouseout': 'mouseout'
    },
    initialize: function() {
        this.model.bind('change', this.render, this);

    },
    dispatch: function(e) {
        if (this.model.get('disabled') == true) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        if (this.model.get('children').length) return;
        e.preventDefault();
        SpritePad.Objects.menu.trigger(this.model.get('id') + ':click');
    },
    mouseover: function() {
        var dta = this.model.toJSON();

        if (dta.disabled) {

            $(this.el).twipsy('show');
        }
    },
    mouseout: function() {
        $(this.el).twipsy('hide');
    },
    render: function() {
        if (this.first_render != true) {
            var dta = this.model.toJSON();
            $(this.el).twipsy({
                placement: (dta.child) ? 'right' : 'below',
                fallback: dta.disable_message,
                trigger: 'manual'
            });

            if (dta.type === 'divider') {
                this.el.className = 'divider';
                if (dta.hidden) {
                    this.el.className += ' hidden';
                }
                return this;
            }
            var html = this.template(dta);
            if (typeof dta.children !== 'undefined') {
                this.el.className = 'dropdown';
            }
            if (dta.disabled) {
                this.el.className += ' disabled';
            }
            if (dta.hidden) {
                this.el.className += ' hidden';
            }
            $(this.el).html(html);
            this.first_render = true;
        } else {
            var dta = this.model.toJSON();
            $('a:first', this.el).html(dta.title);
            if (dta.hidden) $(this.el).addClass('hidden'); else $(this.el).removeClass('hidden');
            if (dta.disabled) $(this.el).addClass('disabled'); else $(this.el).removeClass('disabled');
        }
        return this;
    }
});
SpritePad.Views.RemoteFiles = Backbone.View.extend({
    tagName: 'div',
    className: 'remotefiles',
    template: _.template($('#tpl_file_chooser').html()),
    item_template: _.template($('#tpl_file-selector').html()),
    events: {
        "click .media-grid li": "select",
        "dblclick .media-grid li": "quickopen"
    },
    initialize: function(data) {
        this.model.bind('change:file_list', this.render, this);

        this.savemode = data.savemode;

        this.dta = {
            id1: String(Math.random()).split('.')[1],
            id2: String(Math.random()).split('.')[1]
        };
        $(this.el).html(this.template(this.dta));
    },
    render: function() {
        var file_list = this.model.get('file_list');
        var _this = this;

        var html_a = '', html_b = '';

        if (file_list.own.length || this.savemode) {
            if (this.savemode) {
                html_a += _this.item_template({id: 0, title: 'New Spritemap'});
            }
            _(file_list.own).each(function(item) {
                html_a += _this.item_template(item);
            });
            $('.own', this.el).html(html_a).show();
            $('.own_empty', this.el).hide();
        } else {
            $('.own', this.el).hide();
            $('.own_empty', this.el).show();
        }

        if (file_list.shared.length) {
            _(file_list.shared).each(function(item) {
                html_b += _this.item_template(item);
            });
            $('.shared', this.el).html(html_b).show();
            $('.shared_empty', this.el).hide();
        } else {
            $('.shared', this.el).hide();
            $('.shared_empty', this.el).show();
        }

    },
    select: function(e) {
        $('.selected', this.el).removeClass('selected');
        $(e.currentTarget).addClass('selected');
        var document_id = $(e.currentTarget).attr('data-id');

        if (document_id > 0) {
            var files = this.model.get('file_list'),
                selected;

            if(files.own.length)
            selected = _.find(files.own, function(item) {
                return item.id == document_id;
            });

            if (!selected && files.shared.length) selected = _.find(files.shared, function(item) {
                return item.id == document_id;
            });
        } else {
            selected = {
                owner_id: SpritePad.Objects.user.id,
                create_time: 0,
                change_time: 0,
                title: "New Spritemap"
            };
        }

        var model = new SpritePad.Models.RemoteFile(selected);
        SpritePad.Objects.files.selected = model;
        SpritePad.Objects.files.trigger('selected', model);
    },
    quickopen: function() {
        if(this.savemode){
            SpritePad.Objects.trigger('document:save');
            return;
        };
        SpritePad.Objects.trigger('document:load');
    }
});
SpritePad.Views.ShareView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#tpl_share').html()),
    events: {
        "click .delete": "removeshare"
    },
    initialize: function() {
        $('#sharetable').append(this.render().el);
    },
    render: function() {
        var dta = this.model.toJSON();
        $(this.el).html(this.template(dta));
        return this;
    },
    removeshare: function() {
        var model = this.model;
        var el = this.el;
        if (confirm('Do you really want to remove this person?\nHe won\'t be able to access this spritemap, anymore!')) {
            this.model.set({remove: true});
            SpritePad.Objects.api({
                method: 'DELETE',
                url: '/share/' + SpritePad.Objects.document.get('id'),
                data:{
                    email: this.model.get('email')
                },
                callback: function(response) {
                    if (response.success == true) {
                        model.destroy();
                        $(el).remove();
                    }
                }
            });
        }
    }
});
SpritePad.Views.ToolboxView = Backbone.View.extend({
    tagName: 'div',
    className: 'modal dark-window',
    model: SpritePad.Models.ToolboxModel,
    template: _.template($('#tpl_toolbox').html()),
    events: {
        "click img,.close": "minimize_toggle",
        "click .btn": "button"
    },
    initialize: function() {
        _this = this;
        SpritePad.Objects.bind('selection:change', function() {
            if (SpritePad.Objects.document.selection.length) {
                this.update();
                $(_this.el).fadeIn();
            } else {
                $(_this.el).fadeOut();
            }
        }, this);

        $('#workspace').append(this.render().el);
        $(this.el).css({
            width: 400,
            bottom: 20,
            top: 'auto'
        }).hide();
    },
    render: function() {
        $el = $(this.el);
        $el.html(this.template());
        return this;
    },
    update: function(){
        var repeatX = true;
        SpritePad.Objects.document.selection.each(function(elm){
            if(elm.expand != 1){
                repeatX = false;
            }
        });

        if(repeatX){
            $('a[data-action=repeatX]', this.el).addClass('toggled');
        } else {
            $('a[data-action=repeatX]', this.el).removeClass('toggled');
        }
    },
    minimize_toggle: function() {
        _this = this;
        $this = $(this.el);

        if (!$this.hasClass('minimized')) {
            $this.addClass('minimized');
            $('.modal-body', this.el).slideUp(100, function() {
                $('.close, h3 span', _this.el).hide();
                $this.animate({
                    width: 44
                }, {duration: 100});
            });
        } else {
            $this.animate({
                    width: 400
                }, 100,
                function() {
                    $('.modal-body', _this.el).slideDown(100);
                    $('.close, h3 span', _this.el).show();
                }).removeClass('minimized');
        }
    },
    button: function(e){
        var sel = SpritePad.Objects.document.selection,
            $target = $(e.currentTarget),
            action = $target.attr('data-action');

        if(!sel.length) return;

        sel.each(function(elm){
            elm.trigger('toolbox:'+action);
        });

        if($target.hasClass('toggleable')){
            $target.toggleClass('toggled');
        };
    }
});
SpritePad.Models.AdModel = Backbone.Model.extend({
        defaults: {
            current: {
                icon: 'ad_star',
                'headline': 'This is a example headline',
                'text': 'This is an example ad, displayed in the lower right.',
                'action': {
                    label: '',
                    action: function() {
                    }
                }
            },
            pool: [],
            current_index: 0
        },
        initialize: function() {
            var _this = this;
            setInterval(function(){_this.switcher.apply(_this)}, 60 * 1000);
        },
        switcher: function() {
            var pool = this.get('pool');
            var current_index = this.get('current_index');
            var i;

            if (current_index < pool.length - 1) {
                current_index++;
            } else {
                current_index = 0;
            }

            this.set({
                current_index: current_index,
                current: pool[current_index]
            });
        }

        ,
        add: function(data) {
            var pool = this.get('pool');
            pool.push(data);
            if (pool.length == 1) {
                this.set({
                    current: data
                });
            }
            this.set({
                pool: pool
            });
        }
    }
)
    ;
SpritePad.Models.DocumentModel = Backbone.Model.extend({
    defaults: {
        width: 640,
        height: 480,
        title: "Untitled Spritemap",
        drag: null,     //Reference to the object to be dragged.
        elements: [],
        guides: [],
        selection: [],
        changed: false
    },
    initialize: function() {
        this.elements = new SpritePad.Collections.ElementCollection;
        this.view = new SpritePad.Views.DocumentView({model: this});
        this.selection = new Backbone.Collection;
        this.selection.is_selected = function(test) {
            var result = false;
            _(this).each(function(element) {
                if (element.x == test.x && element.y == test.y && element.imagehash == test.imagehash) {
                    result = true;
                    return;
                }
            });
            return false;
        }

        SpritePad.Objects.bind('document:change', function(){
            this.set({
                changed: true
            });
        }, this);

        $('#workspace').append(this.view.render().el);
    },
    addElement: function(params) {
        var elm = new SpritePad.Models.ElementModel(params);
        elm.bind('dragstart', this.view.dragstart, this.view);
        this.elements.add(elm);
        SpritePad.Objects.trigger('element:add', elm);
    },
    appendElement: function(element) {
        this.trigger('new_element', element);
    },
    close: function() {
        var changed = this.get('changed');
        if(changed){
            if(!confirm('Do you really want to discard all changes to the current document?')){
                return false;
            }
        }
        this.elements.each(function(e) {
            e.remove();
        });
        $('#styles .node').remove();
        $(this.view.el).remove();
        SpritePad.Objects.document = null;
        return true;
    },
    fetch: function() {
        var dta = this.toJSON();
        var dataset = {
            title: dta.title,
            width: dta.width,
            height: dta.height,
            elements: [],
            guides: []
        };

        var raw_elements = this.elements.toJSON();
        _(raw_elements).each(function(item) {
            dataset.elements.push({
                c: item.name,
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
                e: item.expand,
                H: item.imagehash
            });
        });

        return dataset;
    },
    resize: function(w, h) {
        this.set({
            width: w,
            height: h,
            changed: true
        });
        SpritePad.Objects.trigger('document:resized', {w: w, h: h});
    },
    fit: function() {
        var maxX = 0,
            maxY = 0,
            minX = parseInt(this.get('width')),
            minY = parseInt(this.get('height'));

        this.elements.each(function(element) {
            var dta = element.toJSON();
            if (dta.x < minX) minX = dta.x;
            if (dta.y < minY) minY = dta.y;
            if (dta.x + dta.w > maxX) maxX = dta.x + dta.w;
            if (dta.y + dta.h > maxY) maxY = dta.y + dta.h;
        });

        this.elements.each(function(element) {
            var dta = element.toJSON();
            dta.x -= minX;
            dta.y -= minY;
            element.set(dta);
        });

        this.resize(maxX - minX, maxY - minY);
    }
});
SpritePad.Models.ElementModel = Backbone.Model.extend({
    defaults: {
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        imagedata: null,
        imagehash: null,
        expand: 0,
        name: "default",
        "manual-css": {}
    },
    initialize: function() {
        this.bind('drag:element', function(e){
            var x = this.draginfo.x + e.delta.x,
                y = this.draginfo.y + e.delta.y;

            if(x < 0) x = 0;
            if(y < 0) y = 0;
            if(x + this.get('w') > this.draginfo.maxX) x = this.draginfo.maxX - this.get('w');
            if(y + this.get('h') > this.draginfo.maxY) y = this.draginfo.maxY - this.get('h');

            this.set({
                x: x,
                y: y
            });
        }, this);

        this.bind('dragstart:element', function(e){
            var myPos = $(this.element_view.el).offset();

            this.draginfo = {
                x: myPos.left - e.offset.x,
                y: myPos.top - e.offset.y,
                maxX: e.constraint.x,
                maxY: e.constraint.y
            };
        }, this);

        this.bind('change', function(){
            SpritePad.Objects.trigger('document:change');
        });

        this.bind('toolbox:remove', function(){
            this.remove();
        }, this);

        this.bind('toolbox:repeatX', function(){
            var e = this.get('expand');
            if(e == 0){
                this.set({expand: 1});
            } else {
                this.set({expand: 0});
            }
        }, this);

        //Tries to upload the image content to the server, if necessary.
        this.sync = function() {
            $this = this;
            SpritePad.Objects.api({url: '/buffered', data: {hash: $this.get('imagehash')}, callback: function(response) {
                if (response == false) {
                    var dta = {
                        hash: $this.get('imagehash'),
                        content: $this.get('imagedata').split(',')[1]
                    }
                    SpritePad.Objects.api({url: '/cache', data: dta});
                }
            }});
        }

        this.remove = function() {
            $(this.css_view.el).remove();
            $(this.element_view.el).remove();
            SpritePad.Objects.document.elements.remove(this);
            SpritePad.Objects.document.selection.remove(this);
            SpritePad.Objects.trigger('document:change');
            SpritePad.Objects.trigger('selection:change');
        }

        var image = this.get('imagedata');
        var $this = this;
        if (image + '' == '[object File]') {
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = document.createElement('img');
                img.src = e.target.result;
                if (!img.width || !img.height) {
                    img.onload = function(e) {
                        $this.set({
                            w: e.target.width,
                            h: e.target.height
                        });
                    }
                }
                //Create MD5 Checksum of the Content.
                var checksum = md5(e.target.result.split(',')[1]);
                $this.element_view.first_render = false;
                $this.set({
                    imagehash: checksum,
                    imagedata: e.target.result,
                    w: img.width,
                    h: img.height
                });
                $this.sync();
            }
            reader.readAsDataURL(image);
        }
        this.element_view = new SpritePad.Views.ElementView({model: this});
        this.css_view = new SpritePad.Views.CSSView({model: this});
        SpritePad.Objects.document.appendElement(this.element_view.render().el);
    }
});
SpritePad.Models.filenameModel = Backbone.Model.extend({

});
SpritePad.Models.FileStatus = Backbone.Model.extend({
    defaults: {
        target: null,
        outnode: null
    },
    initialize: function() {
        var view = new SpritePad.Views.FileStatusView({model: this});
        var $this = this;
        SpritePad.Objects.files.bind('selected', function(target) {
            $this.set({target: target});
        });
        $(this.get('outnode')).append(view.render().el);
    }
});
SpritePad.Models.GuideModel = Backbone.Model.extend({
    defaults: {
        pos: 0,
        type: 0 //0 = Horizontal, 1 = Vertical
    }
});
SpritePad.Models.MenuItem = Backbone.Model.extend({
    defaults: {
        type: "entry",
        title: "Default",
        icon: "document",
        child: false,
        disabled: false,
        disable_message: '',
        hidden: false,
        children: []
    }
});
SpritePad.Models.RemoteFile = Backbone.Model.extend({
    defaults: {
        id: 0,
        owner_id: 0,
        create_time: 0,
        change_time: 0,
        title: ""
    }
});
SpritePad.Models.RemoteFiles = Backbone.Model.extend({
    defaults: {
        file_list: []
    },
    initialize: function(){
        
    },
    update: function(){
        var _this = this;
        SpritePad.Objects.api({url: '/files', callback: function(response){
            $('.filecounter').text(response.own.length + ' of ' + SpritePad.Objects.user.save_slots);
            _this.set({
                file_list: response
            })
        }});
    }
});
SpritePad.Models.ShareModel = Backbone.Model.extend({
    defaults: {
        id_document: 0,
        id_account: 0,
        code: '',
        email: '',
        name: '',
        mailhash: '',
        remove: false
    },
    initialize: function() {
        this.set({
            mailhash: md5(this.get('email'))
        });
        this.view = new SpritePad.Views.ShareView({model: this});
    },
    remove_view: function(){
        this.view.remove();
    }
});
SpritePad.Models.ToolboxModel = Backbone.Model.extend({
    defaults: {
        affected: null,
        buttons: new Backbone.Collection
    }
});
SpritePad.Collections.ElementCollection = Backbone.Collection.extend({
    model: SpritePad.Models.ElementModel
});
SpritePad.Collections.FileCollection = Backbone.Collection.extend({
    model: SpritePad.Models.RemoteFile
});
SpritePad.Collections.Menu = Backbone.Collection.extend({
    model: SpritePad.Models.MenuItem,
    /**
     * Renders the Menu Items into a specific element.
     * @param element
     */
    renderTo: function(element) {
        var $element = $(element),
            tmp_child = _.template('<li class="active"><a href="#"><% title %></a></li>'),
            html = '';

        this.each(function(child) {
            html += tmp_child(child);
        });
    }
});
SpritePad.Collections.MenuItems = Backbone.Collection.extend({
    model: SpritePad.Models.MenuItem,
    get_by_id: function(id) {
        return this.find(function(elm) {
            return elm.id == id
        });
    }
});
SpritePad.Collections.SharesCollection = Backbone.Collection.extend({
    model: SpritePad.Models.ShareModel
});
SpritePad.Objects.init.push(function(){
    SpritePad.Objects.menu = new SpritePad.Collections.MenuItems;

    /**
     * This function takes a array of JSON encoded menu Items and returns an array of MenuItem Objects.
     * @param inJSON
     */
    function create_menu_items_from_json(inJSON, target, childmode) {
        if (typeof inJSON === 'string') {
            inJSON = JSON.parse(inJSON);
        }

        var menu_items = [],
            item,
            conf;

        _.each(inJSON, function(item) {
            if (typeof item.id === 'undefined') item.id = '';
            if(childmode){
                item.child = true;
            }

            var theItem = new SpritePad.Models.MenuItem(item);
            SpritePad.Objects.menu.add(theItem);
            var view = new SpritePad.Views.MenuItemView({
                model: theItem
            });
            var html = view.render().el;
            if (typeof item.children !== 'undefined') {
                item.children = new SpritePad.Collections.Menu(create_menu_items_from_json(item.children, view.$('.dropdown-menu'), true));
            }
            $(target).append(html);
            menu_items.push(theItem);
        });

        return menu_items;
    }

    //Creating the Main Menu.
    elements = create_menu_items_from_json([
        {
            type: "entry",
            id: "spritemap",
            title: "Spritemap",
            icon: "document",
            children: [
                {
                    type: "entry",
                    id: "new_spritemap",
                    title: "New Spritemap",
                    icon: 'new_spritemap'
                },
                {
                    type: "divider"
                },
                {
                    type: "entry",
                    id: "load_spritemap",
                    title: "Load Spritemap",
                    icon: "cload-load",
                    disabled: true,
                    disable_message: "Registered users can load and save"
                },
                {
                    type: "entry",
                    id: "save_spritemap",
                    title: "Save Spritemap",
                    icon: "cload-save",
                    disabled: true,
                    disable_message: "Registered users can load and save"
                },
                {
                    type: 'entry',
                    id: 'share_spritemap',
                    title: 'Sharing Options',
                    icon: 'share',
                    disabled: true,
                    disable_message: "Premium users can share documents with other premium or free users"
                },
                {
                    type: "divider"
                },
                {
                    type: "entry",
                    id: "resize",
                    title: "Map Size",
                    icon: "resize"
                },
                {
                    type: "divider"
                },
                {
                    type: "entry",
                    id: "guided_tour",
                    title: "Guided Tour",
                    icon: "tour"
                },
                {
                    type: "entry",
                    id: "about",
                    title: "About",
                    icon: "about"
                }
            ]
        },
        {
            type: "entry",
            id: "download",
            title: "Download",
            icon: "download",
            disabled: true,
            disable_message: "Add sprites to your document to download it"
        },
        {
            type: "entry",
            id: "autosize",
            title: "Fit document",
            icon: "autosize",
            disabled: true,
            disable_message: "Document fit works, when you have added some sprites"
        },
        {
            type: "entry",
            id: "autoalign",
            title: "Auto Alignment",
            icon: "layout",
            disabled: true,
            disable_message: "Auto layout is available for premium users"
        }/*,
        {
            type: "entry",
            id: "settings",
            title: "Settings",
            icon: "settings",
            disabled: true
        }*/
    ], '#main_navigation');


    //Creating the User Menu
    elements = create_menu_items_from_json([
        {
          type: "entry",
          id: "indicator",
          title: "Your premium Account will end in 29 days. <span>Extend now</span>",
          icon: "",
          hidden: true
        },
        {
            type: "entry",
            id: "login",
            title: "Login / Register",
            icon: "login"
        },
        {
            type: "entry",
            id: "user",
            title: "USERNAME",
            icon: "user",
            hidden: true,
            children: [
                {
                    type: "entry",
                    id: "invite_friends",
                    title: "Invite Friends",
                    icon: "invite",
                    hidden: true
                },
                {
                    type: "entry",
                    id: "extend_premium",
                    title: "Extend Premium",
                    icon: "premium",
                    hidden: true
                },
                {
                    type: "entry",
                    id: "teamwork",
                    title: "Teamwork",
                    icon: "team",
                    hidden: true
                },
                {
                    type: "divider",
                    id: "logout_divider"
                },
                {
                    type: "entry",
                    id: "logout",
                    title: "Logout",
                    icon: "logout"
                }
            ]
        }
    ], '#user_navigation');

    $('#headbar').dropdown();

    _.extend(SpritePad.Objects.menu, Backbone.Events);
});
SpritePad.Objects.init.push(function(){
    var adModel = new SpritePad.Models.AdModel();

    adModel.add({
        icon: 'ad_twitter',
        headline: 'You should follow us on twitter!',
        text: 'Be always up to date about SpritePad updates and new tools from the guys who developed SpritePad and SimpLESS.',
        action: {
             label: 'Follow @wearekiss now!',
             action: function(){
                 window.open('http://twitter.com/wearekiss');
             }
        },
        valid: function(){
            return true;
        }
    });

    adModel.add({
        icon: 'ad_star',
        headline: 'Team collaboration',
        text: 'Share your CSS spritemaps within your team, simply connect your account to as many people as you want.',
        action: {
             label: 'Activate team collaboration',
             action: function(){
                 SpritePad.Objects.dialog('#dialog_premium');
             }
        },
        valid: function(){
            if(typeof SpritePad.Objects.user === 'undefined') return false;
            return SpritePad.Objects.user.premium === false;
        }
    });

    adModel.add({
        icon: 'ad_invite',
        headline: 'Invite your friends',
        text: 'Recommend SpritePad to your friends and both of you\'ll get one free bonus-slot to save even more spritemaps in the cloud for free.',
        action: {
             label: 'Invite, and claim space!',
             action: function(){
                 SpritePad.Objects.dialog('#dialog_invite');
             }
        },
        valid: function(){
            if(typeof SpritePad.Objects.user === 'undefined') return false;
            return SpritePad.Objects.user.premium === false;
        }
    });

    adModel.add({
        icon: 'ad_rocket',
        headline: 'Save infinite spritemaps in the cloud',
        text: 'Work whenever and wherever you want. Store as much CSS spritemaps as you want as open, editable versions in the cloud.',
        action: {
             label: 'Unlock infinite space',
             action: function(){
                 SpritePad.Objects.dialog('#dialog_premium');
             }
        },
        valid: function(){
            if(typeof SpritePad.Objects.user === 'undefined') return false;
            return SpritePad.Objects.user.premium === false;
        }
    });

    adModel.add({
        icon: 'ad_lightbulb',
        headline: 'Save and load out of the cloud',
        text: 'Create a your account and save your CSS spritemaps as open, editable versions online.<br>All for free!',
        action: {
             label: 'Create free account now',
             action: function(){
                 SpritePad.Objects.dialog('#dialog_login');
             }
        },
        valid: function(){
            return typeof SpritePad.Objects.user === 'undefined';
        }
    });

    adModel.add({
        icon: 'ad_alarmclock',
        headline: 'Save even more time',
        text: 'With auto-alignment all your images get aligned automatically, saving as much space as possible. Simply magic!',
        action: {
             label: 'Activate auto alignment',
             action: function(){
                 SpritePad.Objects.dialog('#dialog_premium');
             }
        },
        valid: function(){
            if(typeof SpritePad.Objects.user === 'undefined') return false;
            return SpritePad.Objects.user.premium === false;
        }
    });


    var adView = new SpritePad.Views.AdView({model: adModel});

    $('#styles').after(adView.el);
});
SpritePad.Objects.init.push(function() {
    $('#dialog_login,#dialog_premium,#dialog_invite').modal({
        backdrop: true
    });

    SpritePad.Objects.menu.bind('all', function(e) {
        switch (e) {
            case 'login:click':
                piwikTracker.trackPageView('Login Register Dialog');
                $('#txt_login_email,#txt_login_password').val('');
                SpritePad.Objects.dialog('#dialog_login', {
                    success: function() {
                        var dta = {
                            email: $('#txt_login_email').val(),
                            password: $('#txt_login_password').val()
                        };

                        SpritePad.Objects.api({url: '/login', data: dta, callback: function(response) {
                            piwikTracker.trackPageView('Login');
                            if (_.has(response, 'success')) {
                                SpritePad.Objects.trigger('login:success');
                                $('#dialog_login').modal('hide');
                                $('#txt_login_email,#txt_login_password').val('');
                                return;
                            }
                            $('#login_error').slideDown().children('.message').text(response.error.message);
                            setTimeout(function(){
                                $('#login_error').slideUp();
                            }, 3000);
                            SpritePad.Objects.trigger('login:error', response.error);
                        }});

                        return false;
                    },

                    register: function(dialog) {
                        var dta = {
                            email: $('#txt_login_email').val(),
                            password: $('#txt_login_password').val()
                        };
                        SpritePad.Objects.api({url:'/register', data:dta, callback:function(response) {
                            piwikTracker.trackPageView('Register');
                            if (_.has(response, 'success')) {
                                piwikTracker.trackGoal(6);
                                SpritePad.Objects.api({url:'/login', data:dta, callback:function(response) {
                                    if (_.has(response, 'success')) {
                                        SpritePad.Objects.trigger('login:success');
                                        dialog.modal('hide');
                                        return;
                                    }
                                    SpritePad.Objects.trigger('login:error', response.error);
                                }});
                                $('#txt_login_email,#txt_login_password').val('');
                                return;
                            }
                            $('#login_error').slideDown().children('.message').text(response.error.message);
                            setTimeout(function(){
                                $('#login_error').slideUp();
                            }, 3000);
                            SpritePad.Objects.trigger('register:error', response.error);
                        }});
                    }
                });
                setTimeout(function(){
                    $('#txt_login_email').focus();
                }, 500);
                break;
        }
    });

    SpritePad.Objects.bind('element:add', function(){
        piwikTracker.trackPageView('Add Element');
        SpritePad.Objects.menu.get_by_id('download').set({disabled: false});
        SpritePad.Objects.menu.get_by_id('autosize').set({disabled: false});
        if(typeof SpritePad.Objects.user !== 'undefined'){
            if(SpritePad.Objects.user.premium){
                SpritePad.Objects.menu.get_by_id('autoalign').set({disabled: false});
            }
        }
    });

    $('#dialog_resize').modal({backdrop: true});
    SpritePad.Objects.menu.bind('resize:click', function(){
        piwikTracker.trackPageView('Resize Dialog');
        $('#txt_doc_width').val(SpritePad.Objects.document.get('width'));
        $('#txt_doc_height').val(SpritePad.Objects.document.get('height'));
        SpritePad.Objects.dialog('#dialog_resize',{
            success: function(){
                var width = parseInt($('#txt_doc_width').val());
                var height = parseInt($('#txt_doc_height').val());
                SpritePad.Objects.document.resize(width, height);
            }
        });
    });

    SpritePad.Objects.menu.bind('autosize:click', function(){
        piwikTracker.trackPageView('Fit Document');
        SpritePad.Objects.document.fit();
    });

    SpritePad.Objects.menu.bind('autoalign:click', function(){
        piwikTracker.trackPageView('Auto Alignment');
        SpritePad.Objects.layout();
    });

    SpritePad.Objects.menu.bind('download:click', function(){
        var data = SpritePad.Objects.document.fetch();
        SpritePad.Objects.api({url:'/download_token', data:data, callback:function(response){
            if(response.token){
                piwikTracker.trackPageView('Download');
                document.location.href = 'api/download/'+response.token+'.zip';
            }
        }});
    });

    SpritePad.Objects.menu.bind('new_spritemap:click', function(){
        piwikTracker.trackPageView('New Spritemap');
        SpritePad.Objects.document.close();
        SpritePad.Objects.newDocument();
    });

    SpritePad.Objects.menu.bind('extend_premium:click', function(){
        piwikTracker.trackPageView('Premium Dialog');
        $('#userid').val(SpritePad.Objects.user.id);
       SpritePad.Objects.dialog('#dialog_premium');
    });
    SpritePad.Objects.menu.bind('indicator:click', function(){
        piwikTracker.trackPageView('Premium Dialog');
        $('#userid').val(SpritePad.Objects.user.id);
        SpritePad.Objects.dialog('#dialog_premium');
    });

    SpritePad.Objects.menu.bind('invite_friends:click', function(){
        piwikTracker.trackPageView('Invite Dialog');
        SpritePad.Objects.dialog('#dialog_invite');
    });

    $('#dialog_about').modal({backdrop:true});
    SpritePad.Objects.menu.bind('about:click', function(){
        piwikTracker.trackPageView('About Dialog');
       $('#dialog_about').modal('show');
    });

    SpritePad.Objects.menu.bind('guided_tour:click', function(){
        piwikTracker.trackPageView('Guided Tour');
        SpritePad.Objects.tourguide.start();
    });
});
SpritePad.Objects.init.push(function() {
    SpritePad.Objects.bind('premium', function() {
        $LAB
            .script('lib/js/premium/tokiosubway.js')
            .wait(function() {
                SpritePad.Objects.trigger('document:new');
            });

    });


    SpritePad.Objects.newDocument = function(document_id) {
        if(SpritePad.Objects.document != null && SpritePad.Objects.document != undefined){
            if(!SpritePad.Objects.document.close()){
                return;
            }
        }

        SpritePad.Objects.document = new SpritePad.Models.DocumentModel();
        if(_(document_id).isNumber()){
            SpritePad.Objects.document.set({id: document_id});
        }
        SpritePad.Objects.trigger('document:new');
    };
    SpritePad.Objects.newDocument();
});
SpritePad.Objects.init.push(function() {
    /**
     * The tourguide can show guided tours to visitors.
     * Its based on the twitter bootstrap and needs:
     * bootstrap-twipsy.js
     * Christians modified bootstrap-popover.js
     * @autor: Christian Engel <hello@wearekiss.com>
     */
    SpritePad.Objects.tourguide = {
        tourdata: null,
        progress: null,
        opendata: [],
        lasttarget: null,

        /**
         * This sets the tourdata for the tourguide to follow.
         * @param tourdata
         */
        tour: function(tourdata) {
            this.tourdata = tourdata;
        },

        start: function() {
            this.resume(0);
        },

        resume: function(index) {
            if (this.lasttarget != null) {
                this.lasttarget.popover('clear');
            }
            this.progress = index;
            var entry = this.tourdata[index],
                addition = '';

            if (typeof entry.buttons != 'undefined' || typeof entry.goal != 'undefined') {
                addition = '<div class="actionpanel">';
            }

            if (typeof entry.buttons == 'object') {
                var cnt = 0;
                var keys = [];
                for (var key in entry.buttons) {
                    keys.push(key);
                }
                keys = keys.reverse();

                this.opendata = [];
                for (var xkey = 0; xkey < keys.length; xkey++) {
                    key = keys[xkey];
                    this.opendata.push(entry.buttons[key]);
                    addition += '<a href="#" onclick="return SpritePad.Objects.tourguide.buttonpress(' + cnt + ');" class="btn small ' + (xkey == keys.length - 1 && key.toLowerCase() != 'cancel' ? 'primary' : '') + '">' + key + '</a> ';
                    cnt++;
                }
            }

            if (typeof entry.goal == 'string') {
                addition += '<i>' + entry.goal + '</i>';
            }

            if (addition) addition += '</div>';

            this.lasttarget = $(entry.target).popover({
                placement: entry.position,
                source: 'manual',
                title: entry.title,
                content: entry.content.replace(/\n/g, '<br>') + addition,
                trigger: 'manual',
                html: 'true',
                offset: entry.offset || 0
            }).popover('show');

            if (typeof entry.helper == 'function') entry.helper();
        },

        buttonpress: function(index) {
            var action = this.opendata[index];
            if (action === null) {
                this.lasttarget.popover('clear');
                return false;
            }
            if (typeof action == 'function') {
                var result = action();
                this.lasttarget.popover('clear');
                if (result !== null) {
                    this.resume(result);
                }
                return false;
            }
            this.lasttarget.popover('clear');
            this.resume(action);
            return false;
        }
    }

    // ================================================================================================================================================

    SpritePad.Objects.tourguide.tour({
        0:{
            target: '#logo',
            position: 'below-left',
            offset: 10,
            title: 'Simply create CSS sprites',
            content: 'With SpritePad you can create your CSS sprites within <span style="text-decoration: line-through">minutes</span> seconds. Simply drag & drop your images and have them immediately available as one PNG sprite + CSS code. No fiddling in Photoshop, no manual assignment of CSS styles.\n' +
                '\nOur <b>guided tour</b> shows you everything you need to know in just 3 simple steps to smoothly start with SpritePad.',
            buttons: {
                'Start the tour': 1,
                'No, thank you': null
            }
        },
        1:{
            target: '.canvas',
            position: 'below',
            offset: -150,
            title: 'Drag & drop your images',
            content: 'Using SpritePad is easier than writing e-mails. Simply drag & drop all the sprite images you need for your website onto the canvas.\n\nContinue by dropping your first image onto the canvas',
            buttons: {
                'Cancel': null
            },
            helper: function(){
                var element_count = SpritePad.Objects.document.elements.length;
                if(element_count){
                    SpritePad.Objects.tourguide.resume(2);
                    return;
                }

                SpritePad.Objects.bind('element:add', function(){
                    if(SpritePad.Objects.tourguide.progress == 1){
                        SpritePad.Objects.tourguide.resume(2);
                    }
                });
            }
        },
        2: {
            target: '#styles .node:first',
            position: 'left-top',
            offset: 0,
            'title': 'SpritePad automatically creates the CSS for you',
            content: 'Every time you add an image, SpritePad creates a CSS code snippet for it. Move your images around, click to select, change options and let the CSS styles get updated automatically.',
            buttons: {
                'Next step': 3,
                'Cancel': null
            }
        },
        3: {
            target: '#download',
            position: 'below-left',
            offset: 10,
            title: 'Download your PNG sprite and CSS code',
            content: 'Finalize creating your spritemap by fitting the document to your images. You can download your spritemap as one PNG + CSS code whenever you want.',
            buttons: {
                'Finish': 4,
                'Cancel': null
            }
        },
        4: {
            target: '#login',
            position: 'below-right',
            offset: 10,
            title: 'That’s it',
            content: 'Now you know all basics about SpritePad and should try the app yourself. We would recommend you to start by creating your own free SpritePad account. Our free account allows you to load and save all your spritemaps as open and editable versions in the cloud.',
            buttons: {
                'Register free account': null,
                'Close': null
            },
            helper: function(){
                $('.popover .primary').one('click', function(){
                    $('#dialog_login').modal('show');
                });
            }
        }
    });

    /* SpritePad.Objects.tourguide.tour({
     0: {
     target: '#logo',
     position: 'below-left',
     offset: 10,
     title: 'Welcome to SpritePad!',
     content:    'This seems like your first visit here. \n' +
     'Would you like to take a short feature tour? \n' +
     'Don\'t be afraid, it will be really short and fun!',
     buttons: {
     'Let\'s go!': 1,
     'No, thanks': 999
     }
     },

     1: {
     target: '#excanvas',
     position: 'below',
     offset: -150,
     title: 'Your playground',
     content:    'This is your working area. \n' +
     'Drag & Drop sprite images from your harddrive here. \n\n' +
     'If you have no idea what a sprite or spritemap is, <a href="http://en.wikipedia.org/wiki/Sprite_(computer_graphics)#Sprites_by_CSS" target="_blank">click here</a>.',
     goal:   'Drop a sprite image now, to continue.',
     helper: function() {
     piwikTracker.trackGoal(4);
     app.event.listen('canvas.element.add', function() {
     if (app.tourguide.progress == 1) {
     setTimeout(function() {
     app.tourguide.resume(2);
     }, 200);
     }
     });
     }
     },

     2: {
     target: '#element0',
     position: 'below-left',
     title: 'Your sprite',
     content:    'Your image has been loaded and embedded in your spritemap. \n' +
     'You can drag it around with the mouse to move it to a specific position. \n',
     goal:   'Drag it now, to see the CSS styles updated in realtime.',
     helper: function() {
     app.event.listen('canvas.move', function() {
     if (app.tourguide.progress == 2) {
     app.tourguide.resume(3);
     }
     });
     }
     },

     3:{
     target: '#node0',
     position: 'left-top',
     title: 'Your CSS styles',
     content:    'You can see: css data is automatically generated and updated when you drop new sprites or drag them around.',
     buttons: {
     'Go ahead': 4
     }
     },

     4:{
     target: '#node0',
     position: 'left-top',
     title: 'Coming soon',
     content:    'Not available now, but work in progress is making the css-styles you see here editable.\n<b>Note:</b> The classname is taken from the filename of the sprite image.',
     buttons: {
     'Proceed': 5
     }
     },

     5:{
     target: '#excanvas',
     position: 'below',
     offset: -480,
     title: 'Guides',
     content: 'SpritePad supports guides as you know them from photoshop. Click on the horizontal or vertical ruler and drag out some guides.',
     goal: 'Drag out a guide from the rulers above or left of the document.',
     helper: function() {
     app.event.listen('canvas.guide.add', function() {
     $('#excanvas').popover('clear');
     $('body').one('mouseup', function() {
     app.tourguide.resume(6);
     });
     });
     }
     },

     6:{
     target: '#element0',
     position: 'right',
     title: 'Magnetic Docking',
     content: 'SpritePad supports magnetic docking of elements and guides.',
     goal: 'Drag your element and make it dock to the guide.',
     helper: function() {
     app.event.listen('canvas.element.dock.guide', function() {
     if (app.tourguide.progress == 6) {
     app.tourguide.resume(7);
     }
     });
     }
     },

     7: {
     target: '#element0',
     position: 'right',
     title: 'Selection',
     content: 'When you select an element, SpritePad offers you more options for it.\nYou can select elements with a left click.',
     goal: 'Select this element now.',
     helper: function() {
     app.event.listen('canvas.selected', function() {
     if (app.tourguide.progress == 7) {
     app.tourguide.resume(8);
     }
     });
     }
     },

     8: {
     target: '#toolbox',
     position: 'above',
     title: 'The selection toolbox',
     content: 'This box appears only when one or more elements are selected. It offers you more options to manipulate these elements.\nAt the moment there is only one option: making the sprite repeat horizontally.',
     goal: 'Activate the "repeat horizontal" option.',
     helper: function() {
     $('a[data-action="expand-and-repeat"]').one('click', function() {
     app.tourguide.resume(9);
     });
     }
     },

     9: {
     target: '#element0',
     position: 'right',
     title: 'Repeated sprite',
     content: 'As you see: the sprite gets repeated.\nThis also reflects in a different css style.',
     buttons: {
     'Next': 10
     }
     },

     10: {
     target: '#excanvas',
     position: 'below',
     offset: -100,
     title: 'Using autoscale',
     content: 'We have deactivated the repetition again.\nFor the next feature, we need you to drop another sprite image. Or the same image again - just as you like.',
     goal: 'Drop another sprite image, now.',
     helper: function() {
     app.event.dispatch('element.expand-and-repeat.off');
     app.event.listen('canvas.element.add', function() {
     if (app.tourguide.progress == 10) {
     app.tourguide.resume(11);
     }
     });
     }
     },

     11:{
     target: '#btn-autoscale',
     position: 'below',
     title: 'Using autoscale',
     content: 'If you are fine with your spritemap layout, press this button to get unnecessary whitespace trimmed away.',
     goal: 'Do it! Press the button.',
     helper: function() {
     $('#btn-autoscale').one('click', function() {
     app.tourguide.resume(12);
     });
     }
     },

     12:{
     target: '#excanvas',
     position: 'right',
     title: 'Document is shrinked',
     content: 'Did you see? The sprite image got a whole lot smaller.\nBut what, if we want to add more elements and don\'t have enough space now?\nWell, just rescale the document, then =)',
     buttons: {
     'Next': 13
     }
     },

     13:{
     target: '#scale',
     position: 'right',
     title: 'Scale your document',
     content: 'Hover with your mouse here. If the scale icon appears, click and drag to set a new size for your document.',
     goal: 'Scale your document now.',
     helper: function() {
     $('#scale').one('mousedown', function() {
     $('#scale').popover('clear');
     });
     app.event.listen('document.scale', function() {
     if (app.tourguide.progress == 13) {
     app.tourguide.resume(997);
     }
     });
     }
     },

     992: {
     target: '#user',
     position: 'below-right',
     title: 'Waiting for activation',
     content: 'Your connection to the account has been processed.<br>However - the account holder has to accept your connection.',
     buttons: {
     'Close': null
     }
     },


     993: {
     target: '#user',
     position: 'below-right',
     title: 'Powermode active',
     content: 'Powermode will be active until:<br>',
     buttons: {
     'Close': null
     }
     },

     994: {
     target: '#user',
     position: 'below-right',
     title: 'Payment processed',
     content: 'Thanks for activating SpritePad powermode!<br>Your order motivates us to put more efford into SpritePad. You rock! :)<br><br>Powermode will be active until:<br>',
     buttons: {
     'Close': null
     }
     },

     995: {
     target: '#user',
     position: 'top',
     title: '',
     content: '',
     helper: function() {
     app.ui.buy_powermode();
     $('#user').popover('clear');
     }
     },

     996: {
     target: '#user',
     position: 'below-right',
     title: 'Normal User',
     content: 'Invite some friends to SpritePad to gain more save slots for you and them, or activate SpritePads powermode to unleash full power.',
     buttons: {
     'Activate Powermode': 995,
     'No, thank you': null
     }
     },

     997:{
     target: '#logo',
     position: 'below-left',
     offset: 10,
     title: 'You did it!',
     content: 'Well, thats it for now with our guided tour.\nIf we implement new features soon, we will offer you new guides, as well.',
     buttons: {
     'Finish': 999
     },
     helper: function() {
     piwikTracker.trackGoal(5);
     }
     },

     998: {
     target: '#logo',
     position: 'below-left',
     offset: 10,
     title: 'Guided Tour',
     content: 'Welcome to the guided tour of SpritePad.\n' +
     'This short tour shows you all features of SpritePad, to make you a CSS Spritemap Jedi.',
     buttons: {
     'Proceed': 1,
     'I\'m already a Jedi': null
     }
     },
     999: {
     target: '#spritemap',
     position: 'below-left',
     offset: 10,
     title: 'Have fun!',
     content: 'If you want to repeat the tour, just click here and choose "Guided Tour".',
     buttons: {
     'Understood': null
     },
     helper: function() {
     localStorage.setItem('did_tour', true);
     }
     }
     }); */
});
SpritePad.Objects.init.push(function() {
    var file_handler = new SpritePad.Models.RemoteFiles();
    var view_load = new SpritePad.Views.RemoteFiles({model: file_handler});
    var view_save = new SpritePad.Views.RemoteFiles({model: file_handler, savemode: true});

    $('#dialog_load .modal-body').prepend(view_load.el);
    $('#dialog_save .modal-body').prepend(view_save.el);

    $('#dialog_load, #dialog_save').tabs().modal({backdrop: true});

    SpritePad.Objects.files = _({}).extend(Backbone.Events);

    //====================================================================================
    // DOCUMENT LOAD FUNCTION
    //====================================================================================
    SpritePad.Objects.bind('document:load', function() {
        var id = 0;
        if (SpritePad.Objects.files.selected != null) {
            id = SpritePad.Objects.files.selected.id;
        }
        if (!id) return false;

        piwikTracker.trackPageView('Load File');

        SpritePad.Objects.api({url:'/load/' + id, callback:function(response) {
            if (response.data) {
                var data = response.data;
                if (!SpritePad.Objects.document.close()) {
                    return;
                }
                SpritePad.Objects.newDocument(parseInt(id));
                SpritePad.Objects.document.resize(parseInt(data.width), parseInt(data.height));
                _.each(data.elements, function(element) {
                    SpritePad.Objects.document.addElement({
                        imagehash: element.H,
                        name: element.c,
                        expand: parseInt(element.e),
                        h: parseInt(element.h),
                        w: parseInt(element.w),
                        x: parseInt(element.x),
                        y: parseInt(element.y)
                    });
                });
                SpritePad.Objects.document.set({changed: false});
            }
        }});
        $('#dialog_load').modal('hide');
    });

    //====================================================================================
    // DOCUMENT SAVE FUNCTION
    //====================================================================================
    SpritePad.Objects.bind('document:save', function() {
        var id = 0;
        if (SpritePad.Objects.files.selected != null) {
            id = SpritePad.Objects.files.selected.get('id');
        }

        var data = SpritePad.Objects.document.fetch();

        piwikTracker.trackPageView('Save File');

        var send = {
            id: String(id),
            title: SpritePad.Objects.files.selected.get('title'),
            width: data.width,
            height: data.height,
            elements: data.elements
        }

        SpritePad.Objects.api({url:'/save', data:send, callback:function(response){
            if(response.success){
                $('#dialog_save').modal('hide');
                SpritePad.Objects.document.set({
                    id: response.success.id
                });
                return;
            }
            $('#dialog_save .error').slideDown().children('.message').text(response.error.message);
            setTimeout(function(){
                $('#dialog_save .error').slideUp();
                $('#dialog_save .submit').removeClass('disabled');
            }, 3000);
        }});
    });

    SpritePad.Objects.menu.bind('load_spritemap:click', function() {
        $('#dialog_load .submit').addClass('disabled');
        $('#dialog_load .error').hide();
        file_handler.update();
        piwikTracker.trackPageView('Dialog Load');
        SpritePad.Objects.dialog('#dialog_load', {
            success: function() {
                SpritePad.Objects.trigger('document:load');
            }
        });
    });

    SpritePad.Objects.menu.bind('save_spritemap:click', function() {
        if(SpritePad.Objects.document.elements.length == 0){
            //alert('You cannot save an empty document.');
            //return;
        }
        $('#dialog_save .submit').addClass('disabled');
        $('#dialog_save .error').hide();
        file_handler.update();
        piwikTracker.trackPageView('Dialog Save');
        SpritePad.Objects.dialog('#dialog_save', {
            success: function() {
                SpritePad.Objects.trigger('document:save');
                $('#dialog_save .submit').addClass('disabled');
                return false;
            }
        });
    });

    //=========================== Activates the Save/Load buttons in the dialogs
    SpritePad.Objects.files.bind('selected', function(){
        $('#dialog_save .submit, #dialog_load .submit').removeClass('disabled');
    }, this);


    var filename = new SpritePad.Views.filenameView();
    $('#savestatus').append(filename.el);
});
/**
 * Opens a new modal dialog.
 * Success callback is called if a button with the class "submit" is clicked.
 * cancel callback is called if a button with the class "cancel" is clicked.
 * @param string id Provide a jQuery ID beginning with #.
 * @param function success_callback
 * @param function cancel_callback
 */
SpritePad.Objects.dialog = function(id, callbacks) {
    $dialog = $(id);
    if (typeof callbacks === 'undefined') callbacks = {};

    var click_catch = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $target = $(e.target);

        if($target.hasClass('disabled')) return;

        if ($target.hasClass('cancel')) {
            if (typeof callbacks.cancel === 'function') {
                var result = callbacks.cancel();
                if (result !== false) {
                    $dialog.modal('hide');
                    return;
                }
            } else {
                $dialog.modal('hide');
                return;
            }
        }

        if ($target.hasClass('submit')) {
            if (typeof callbacks.success === 'function') {
                var result = callbacks.success();
                if (result !== false) {
                    $dialog.modal('hide');
                    return;
                }
            } else {
                $dialog.modal('hide');
                return;
            }
        }

        if ($target.hasClass('btn')) {
            if (typeof callbacks[$target.attr('data-callback')] === 'function') {
                callbacks[$target.attr('data-callback')]($dialog);
            }
        }
    }
    if ($dialog.data('dialog_initiated') != true) {
        $dialog.delegate('a', 'click', click_catch);
        $dialog.data('dialog_initiated', true);
    }

    $dialog.modal('show');
};

/**
 * Makes a call to the spritepad server api
 * @param method
 * @param post_data
 */
SpritePad.Objects.api = function(params) {
    if (typeof params.method === 'undefined') {
        params.method = (typeof params.data !== 'object') ? 'GET' : 'POST';
    }

    if (typeof params.data === 'object') {
        params.data.csrf = SpritePad.Objects.csrf;
    } else if(params.method == 'POST'){
        params.data = {
            csrf: SpritePad.Objects.csrf
        }
    }

    if (params.method == 'POST') {
        //Make a POST call!
        $.post(SpritePad.Objects.api_url + params.url, params.data, function(response) {
            if (typeof params.callback === 'function') {
                params.callback($.parseJSON(response));
            }
        });
        return;
    }

    //Make a GET call!
    if (params.method == 'GET') {
        $.getJSON(SpritePad.Objects.api_url + params.url, function(response) {
            if (typeof params.callback === 'function') {
                params.callback(response);
            }
        });
        return;
    }

    //Make a custom call!
    $.ajax({
        url: SpritePad.Objects.api_url + params.url,
        cache: false,
        data: params.data,
        success: function(response) {
            if (typeof params.callback === 'function') {
                params.callback($.parseJSON(response));
            }
        },
        type: params.method
    });
};

SpritePad.Objects.init.push(function() {
    SpritePad.Objects.csrf = $('#csrf').attr('content');
    SpritePad.Objects.api_url = 'api';
    $('#loadlist,#savelist').tabs();
});

SpritePad.Objects.init.push(function() {
    $(window).bind('keydown', function(e) {
        switch (e.keyCode) {
            case 37: //Left
                if (typeof SpritePad.Objects.document === 'undefined') return;
                if (SpritePad.Objects.document.selection.length) {
                    SpritePad.Objects.document.selection.each(function(element) {
                        var pos = element.get('x');
                        pos -= 1;
                        if (e.shiftKey) pos -= 9;
                        element.set({
                            x: pos
                        });
                    });
                }
                break;
            case 38: //Up
                if (typeof SpritePad.Objects.document === 'undefined') return;
                if (SpritePad.Objects.document.selection.length) {
                    SpritePad.Objects.document.selection.each(function(element) {
                        var pos = element.get('y');
                        pos -= 1;
                        if (e.shiftKey) pos -= 9;
                        element.set({
                            y: pos
                        });
                    });
                }
                break;
            case 39: //Right
                if (typeof SpritePad.Objects.document === 'undefined') return;
                if (SpritePad.Objects.document.selection.length) {
                    SpritePad.Objects.document.selection.each(function(element) {
                        var pos = element.get('x');
                        pos += 1;
                        if (e.shiftKey) pos += 9;
                        element.set({
                            x: pos
                        });
                    });
                }
                break;
            case 40: //Down
                if (typeof SpritePad.Objects.document === 'undefined') return;
                if (SpritePad.Objects.document.selection.length) {
                    SpritePad.Objects.document.selection.each(function(element) {
                        var pos = element.get('y');
                        pos += 1;
                        if (e.shiftKey) pos += 9;
                        element.set({
                            y: pos
                        });
                    });
                }
                break;
            case 8:     //Backspace
                e.preventDefault();
            case 46:    //Delete
                if (typeof SpritePad.Objects.document === 'undefined') return;
                if (SpritePad.Objects.document.selection.length) {
                    SpritePad.Objects.document.selection.each(function(element) {
                        element.remove();
                    });
                }
            break;
        }
    });
});
SpritePad.Objects.init.push(function() {

    var shares = new SpritePad.Collections.SharesCollection();

    SpritePad.Objects.bind('premium', function() {
        SpritePad.Objects.menu.get_by_id('share_spritemap').set({disabled: false});
    });

    SpritePad.Objects.menu.bind('share_spritemap:click', function() {
        var doc_id = SpritePad.Objects.document.get('id');
        if (!doc_id) {
            alert('You have to save this document to share it.');
            return;
        }

        SpritePad.Objects.api({url:'/share/' + doc_id, callback:function(response) {
            if(typeof response.error !== 'undefined'){
                alert('You can\'t change settings for documents shared with you.');
                return;
            }
            shares.each(function(elm) {
                elm.remove_view();
            });
            shares.reset(response.data);
            if (response.data.length) {
                $('#dialog_share .not-shared').hide();
                $('#dialog_share .shared').show();
            } else {
                $('#dialog_share .not-shared').show();
                $('#dialog_share .shared').hide();
            }
            $('#dialog_share .greybox .text').val('Enter your friend\'s email address');
            SpritePad.Objects.dialog('#dialog_share');
        }});
    });

    /*
     Add a new email!
     */
    $('#dialog_share .greybox .btn-blue').click(function() {
        var email = $('#dialog_share .greybox .text').val();
        if (!email.match(/^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/)) {
            $('#dialog_share .errormessage').slideDown();
            setTimeout(function() {
                $('#dialog_share .errormessage').slideUp();
            }, 2000);
            return;
        }

        var doc_id = SpritePad.Objects.document.get('id');
        SpritePad.Objects.api({url:'/share/' + doc_id, data:{email: email}, callback:function(response) {
            if (typeof response.code !== 'undefined') {
                $('#dialog_share .message').slideDown();
                setTimeout(function() {
                    $('#dialog_share .message').slideUp();
                }, 2000);
            }

            shares.add({
                code: response.code,
                email: email,
                registered: 0
            });

            $('#dialog_share .not-shared').hide();
            $('#dialog_share .shared').show();
        }});
    });

    $('#dialog_share').modal({backdrop: true});

    $('#dialog_share .text').focus(
        function() {
            $this = $(this);
            if ($this.val() == 'Enter your friend\'s email address') {
                $this.val('');
            }
        }).blur(function() {
            if ($this.val() == '') {
                $this.val('Enter your friend\'s email address');
            }
        });
});
SpritePad.Objects.init.push(function() {
    var toolbox = new SpritePad.Models.ToolboxModel();
    var toolbox_view = new SpritePad.Views.ToolboxView({model: toolbox});
});
SpritePad.Objects.init.push(function() {
    SpritePad.Objects.bind('login:success', function() {
        SpritePad.Objects.api({url:'/user', callback:function(response) {
            SpritePad.Objects.user = response;
            var m = SpritePad.Objects.menu;
            m.get_by_id('login').set({hidden: true});
            m.get_by_id('user').set({
                hidden: false,
                title: response.name
            });

            m.get_by_id('save_spritemap').set({disabled: false});
            m.get_by_id('load_spritemap').set({disabled: false});

            if (response.premium == false) {
                m.get_by_id('invite_friends').set({hidden: false});
                m.get_by_id('extend_premium').set({hidden: false, title: 'Buy Premium'});
                $('.filecounter_element').show();
            } else {
                $('#ad').slideUp();
                m.get_by_id('extend_premium').set({hidden: false, title: 'Extend Premium'});
                var dte = new Date(),
                    now = new Date(),
                    day = 1000 * 60 * 60 * 24,
                    diffdays = 0;
                dte.setTime(response.premium * 1000);
                diffdays = Math.ceil((dte.getTime()-now.getTime()) / day);
                $('#premium_remain b').text(diffdays);

                if(diffdays <= 14){
                    var menu_item = SpritePad.Objects.menu.get_by_id('indicator');
                    menu_item.set({
                       title: 'Only '+diffdays+' days of premium remain. <span>Extend now</span>',
                        hidden: false
                    });
                }

                $('.filecounter_element').hide();

                SpritePad.Objects.trigger('premium');
            }

            $('.invite-code').text(response.invite_id);
            var social_template = _.template($('#tpl_social').html());
            $('#social').html(social_template({code: response.invite_id}));
            twttr.widgets.load();
            FB.XFBML.parse();

            $('#userid').val(response.invite_id);
        }});
    });

    SpritePad.Objects.menu.bind('logout:click', function() {
        SpritePad.Objects.api({method: 'POST', url:'/logout'});
        $('#ad').slideDown();
        var m = SpritePad.Objects.menu;
        m.get_by_id('indicator').set({hidden: true});
        m.get_by_id('user').set({hidden: true, title: 'username'});
        m.get_by_id('login').set({hidden: false});
        m.get_by_id('save_spritemap').set({disabled: true});
        m.get_by_id('load_spritemap').set({disabled: true});
        m.get_by_id('share_spritemap').set({disabled: true});
        SpritePad.Objects.user = null;
    });

    $('#premium_thankyou').modal({backdrop: true});
    $('#buy_1,#buy_6,#buy_12').click(function(e){
       $this = $(this);
       var vals = {
           buy_1: 'One Month',
           buy_6: '6 Months',
           buy_12: '1 Year'
       }

        $('#premium_duration').val(vals[$this.attr('id')]);
        $('#userid').val(SpritePad.Objects.user.id);
        $('#premium_form')[0].submit();
        piwikTracker.trackGoal(7);

        setTimeout(function(){
            $('#dialog_premium').modal('hide');
            $('#premium_thankyou').modal('show');
        }, 2000);
    });
});

SpritePad.init();
