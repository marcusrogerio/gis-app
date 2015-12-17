Ext.onReady( function() {
    var createViewport,
        initialize,
        gis;

    // set app config
    (function() {

        // ext configuration
        Ext.QuickTips.init();

        Ext.override(Ext.LoadMask, {
            onHide: function() {
                this.callParent();
            }
        });

        Ext.override(Ext.grid.Scroller, {
            afterRender: function() {
                var me = this;
                me.callParent();
                me.mon(me.scrollEl, 'scroll', me.onElScroll, me);
                Ext.cache[me.el.id].skipGarbageCollection = true;
                // add another scroll event listener to check, if main listeners is active
                Ext.EventManager.addListener(me.scrollEl, 'scroll', me.onElScrollCheck, me);
                // ensure this listener doesn't get removed
                Ext.cache[me.scrollEl.id].skipGarbageCollection = true;
            },

            // flag to check, if main listeners is active
            wasScrolled: false,

            // synchronize the scroller with the bound gridviews
            onElScroll: function(event, target) {
                this.wasScrolled = true; // change flag -> show that listener is alive
                this.fireEvent('bodyscroll', event, target);
            },

            // executes just after main scroll event listener and check flag state
            onElScrollCheck: function(event, target, options) {
                var me = this;

                if (!me.wasScrolled) {
                    // Achtung! Event listener was disappeared, so we'll add it again
                    me.mon(me.scrollEl, 'scroll', me.onElScroll, me);
                }
                me.wasScrolled = false; // change flag to initial value
            }

        });

        Ext.override(Ext.data.TreeStore, {
            load: function(options) {
                options = options || {};
                options.params = options.params || {};

                var me = this,
                    node = options.node || me.tree.getRootNode(),
                    root;

                // If there is not a node it means the user hasnt defined a rootnode yet. In this case lets just
                // create one for them.
                if (!node) {
                    node = me.setRootNode({
                        expanded: true
                    });
                }

                if (me.clearOnLoad) {
                    node.removeAll(true);
                }

                options.records = [node];

                Ext.applyIf(options, {
                    node: node
                });
                //options.params[me.nodeParam] = node ? node.getId() : 'root';

                if (node) {
                    node.set('loading', true);
                }

                return me.callParent([options]);
            }
        });

        // right click handler
        document.body.oncontextmenu = function() {
            return false;
        };
    }());

    GIS.app = {};

    GIS.app.extendInstance = function(gis) {
        var conf = gis.conf,
            util = gis.util,
            init = gis.init,
            store = gis.store,
            layer;

        // TODO: Add code
    };

    createViewport = function() {
        var centerRegion,
            eastRegion,
            downloadButton,
            shareButton,
            aboutButton,
            defaultButton,
            layersPanel,
            resizeButton,
            viewport,
            onRender,
            afterRender;

        resizeButton = Ext.create('Ext.button.Button', {
            text: '>>>',
            handler: function() {
                eastRegion.toggleCollapse();
            }
        });

        defaultButton = Ext.create('Ext.button.Button', {
            text: GIS.i18n.map,
            iconCls: 'gis-button-icon-map',
            toggleGroup: 'module',
            pressed: true,
            menu: {},
            handler: function(b) {
                console.log("defaultButton Handler disabled");
                /*
                b.menu = Ext.create('Ext.menu.Menu', {
                    closeAction: 'destroy',
                    shadow: false,
                    showSeparator: false,
                    items: [
                        {
                            text: GIS.i18n.clear_map + '&nbsp;&nbsp;', //i18n
                            cls: 'gis-menu-item-noicon',
                            handler: function() {
                                window.location.href = gis.init.contextPath + '/dhis-web-mapping';
                            }
                        }
                    ],
                    listeners: {
                        show: function() {
                            gis.util.gui.window.setAnchorPosition(b.menu, b);
                        },
                        hide: function() {
                            b.menu.destroy();
                            defaultButton.toggle();
                        },
                        destroy: function(m) {
                            b.menu = null;
                        }
                    }
                });

                b.menu.show();
                */
            }
        });

        interpretationItem = Ext.create('Ext.menu.Item', {
            text: 'Write interpretation' + '&nbsp;&nbsp;',
            iconCls: 'gis-menu-item-tablelayout',
            disabled: true,
            xable: function() {
                if (gis.map) {
                    this.enable();
                }
                else {
                    this.disable();
                }
            },
            handler: function() {
                if (viewport.interpretationWindow) {
                    viewport.interpretationWindow.destroy();
                    viewport.interpretationWindow = null;
                }

                viewport.interpretationWindow = GIS.app.InterpretationWindow();
                viewport.interpretationWindow.show();
            }
        });

        pluginItem = Ext.create('Ext.menu.Item', {
            text: 'Embed in web page' + '&nbsp;&nbsp;',
            iconCls: 'gis-menu-item-datasource',
            disabled: true,
            xable: function() {
                // TODO: Add code
            },
            handler: function() {
                // TODO: Add code
            }
        });

        // TODO: Add missing code

        favoriteUrlItem = Ext.create('Ext.menu.Item', {
            text: 'Favorite link' + '&nbsp;&nbsp;',
            iconCls: 'gis-menu-item-datasource',
            disabled: true,
            xable: function() {
                if (gis.map && gis.map.id) {
                    this.enable();
                }
                else {
                    this.disable();
                }
            },
            handler: function() {
                var url = gis.init.contextPath + '/dhis-web-mapping/index.html?id=' + gis.map.id,
                    textField,
                    window;

                textField = Ext.create('Ext.form.field.Text', {
                    html: '<a class="user-select td-nobreak" target="_blank" href="' + url + '">' + url + '</a>'
                });

                window = Ext.create('Ext.window.Window', {
                    title: 'Favorite link' + '<span style="font-weight:normal">&nbsp;|&nbsp;&nbsp;' + gis.map.name + '</span>',
                    layout: 'fit',
                    modal: true,
                    resizable: false,
                    destroyOnBlur: true,
                    bodyStyle: 'padding: 12px 18px; background-color: #fff; font-size: 11px',
                    html: '<a class="user-select td-nobreak" target="_blank" href="' + url + '">' + url + '</a>',
                    listeners: {
                        show: function(w) {
                            this.setPosition(325, 33);

                            if (!w.hasDestroyOnBlurHandler) {
                                gis.util.gui.window.addDestroyOnBlurHandler(w);
                            }

                            document.body.oncontextmenu = true;
                        },
                        hide: function() {
                            document.body.oncontextmenu = function(){return false;};
                        }
                    }
                });

                window.show();
            }
        });

        apiUrlItem = Ext.create('Ext.menu.Item', {
            text: 'API link' + '&nbsp;&nbsp;',
            iconCls: 'gis-menu-item-datasource',
            disabled: true,
            xable: function() {
                if (gis.map && gis.map.id) {
                    this.enable();
                }
                else {
                    this.disable();
                }
            },
            handler: function() {
                var url = gis.init.contextPath + '/api/maps/' + gis.map.id + '/data',
                    textField,
                    window;

                textField = Ext.create('Ext.form.field.Text', {
                    html: '<a class="user-select td-nobreak" target="_blank" href="' + url + '">' + url + '</a>'
                });

                window = Ext.create('Ext.window.Window', {
                    title: 'API link' + '<span style="font-weight:normal">&nbsp;|&nbsp;&nbsp;' + gis.map.name + '</span>',
                    layout: 'fit',
                    modal: true,
                    resizable: false,
                    destroyOnBlur: true,
                    bodyStyle: 'padding: 12px 18px; background-color: #fff; font-size: 11px',
                    html: '<a class="user-select td-nobreak" target="_blank" href="' + url + '">' + url + '</a>',
                    listeners: {
                        show: function(w) {
                            this.setPosition(325, 33);

                            if (!w.hasDestroyOnBlurHandler) {
                                gis.util.gui.window.addDestroyOnBlurHandler(w);
                            }

                            document.body.oncontextmenu = true;
                        },
                        hide: function() {
                            document.body.oncontextmenu = function(){return false;};
                        }
                    }
                });

                window.show();
            }
        });

        shareButton = Ext.create('Ext.button.Button', {
            text: GIS.i18n.share,
            disabled: true,
            xableItems: function() {
                interpretationItem.xable();
                pluginItem.xable();
                favoriteUrlItem.xable();
                apiUrlItem.xable();
            },
            menu: {
                cls: 'gis-menu',
                shadow: false,
                showSeparator: false,
                items: [
                    interpretationItem,
                    pluginItem,
                    favoriteUrlItem,
                    apiUrlItem
                ],
                listeners: {
                    afterrender: function() {
                        this.getEl().addCls('gis-toolbar-btn-menu');
                    },
                    show: function() {
                        shareButton.xableItems();
                    }
                }
            }
        });

        aboutButton = Ext.create('Ext.button.Button', {
            text: GIS.i18n.about,
            menu: {},
            handler: function() {
                console.log("about handler");

                /*
                if (viewport.aboutWindow && viewport.aboutWindow.destroy) {
                    viewport.aboutWindow.destroy();
                    viewport.aboutWindow = null;
                }

                viewport.aboutWindow = GIS.app.AboutWindow();
                viewport.aboutWindow.show();
                */
            }
        });

        var centerRegion = Ext.create('Ext.panel.Panel', {
            region: 'center',
            //map: gis.olmap,
            fullSize: true,
            cmp: [defaultButton],
            trash: [],
            toggleCmp: function(show) {
                for (var i = 0; i < this.cmp.length; i++) {
                    if (show) {
                        this.cmp[i].show();
                    }
                    else {
                        this.cmp[i].hide();
                    }
                }
            },
            tbar: {
                defaults: {
                    height: 26
                },
                items: function() {
                    var a = [];
                    a.push({
                        iconCls: 'gis-btn-icon-' + gis.layer.event.id,
                        //menu: gis.layer.event.menu,
                        tooltip: GIS.i18n.event_layer,
                        width: 26
                    });
                    a.push({
                        iconCls: 'gis-btn-icon-' + gis.layer.facility.id,
                        //menu: gis.layer.facility.menu,
                        tooltip: GIS.i18n.symbol_layer,
                        width: 26
                    });
                    a.push({
                        iconCls: 'gis-btn-icon-' + gis.layer.thematic1.id,
                        //menu: gis.layer.thematic1.menu,
                        tooltip: GIS.i18n.thematic_layer + ' 1',
                        width: 26
                    });
                    a.push({
                        iconCls: 'gis-btn-icon-' + gis.layer.thematic2.id,
                        //menu: gis.layer.thematic2.menu,
                        tooltip: GIS.i18n.thematic_layer + ' 2',
                        width: 26
                    });
                    a.push({
                        iconCls: 'gis-btn-icon-' + gis.layer.thematic3.id,
                        //menu: gis.layer.thematic3.menu,
                        tooltip: GIS.i18n.thematic_layer + ' 3',
                        width: 26
                    });
                    a.push({
                        iconCls: 'gis-btn-icon-' + gis.layer.thematic4.id,
                        //menu: gis.layer.thematic4.menu,
                        tooltip: GIS.i18n.thematic_layer + ' 4',
                        width: 26
                    });
                    a.push({
                        iconCls: 'gis-btn-icon-' + gis.layer.boundary.id,
                        //menu: gis.layer.boundary.menu,
                        tooltip: GIS.i18n.boundary_layer,
                        width: 26
                    });
                    a.push({
                        text: GIS.i18n.favorites,
                        menu: {},
                        handler: function() {
                            console.log("favorites handler");
                            /*
                            if (viewport.favoriteWindow && viewport.favoriteWindow.destroy) {
                                viewport.favoriteWindow.destroy();
                            }

                            viewport.favoriteWindow = GIS.app.FavoriteWindow();
                            viewport.favoriteWindow.show();
                            */
                        }
                    });
                    if (gis.init.user.isAdmin) {
                        a.push({
                            text: GIS.i18n.legends,
                            menu: {},
                            handler: function() {
                                console.log("legends handler");
                                /*
                                if (viewport.legendSetWindow && viewport.legendSetWindow.destroy) {
                                    viewport.legendSetWindow.destroy();
                                }

                                viewport.legendSetWindow = GIS.app.LegendSetWindow();
                                viewport.legendSetWindow.show();
                                */
                            }
                        });
                    }
                    a.push({
                        xtype: 'tbseparator',
                        height: 18,
                        style: 'border-color: transparent #d1d1d1 transparent transparent; margin-right: 4px',
                    });
                    a.push({
                        text: GIS.i18n.download,
                        menu: {},
                        disabled: true,
                        handler: function() {
                            console.log("download handler");
                            /*
                            if (viewport.downloadWindow && viewport.downloadWindow.destroy) {
                                viewport.downloadWindow.destroy();
                            }

                            viewport.downloadWindow = GIS.app.DownloadWindow();
                            viewport.downloadWindow.show();
                            */
                        },
                        xable: function() {
                            if (gis.util.map.hasVisibleFeatures()) {
                                this.enable();
                            }
                            else {
                                this.disable();
                            }
                        },
                        listeners: {
                            added: function() {
                                downloadButton = this;
                            }
                        }
                    });
                    a.push(shareButton);
                    a.push('->');

                    a.push({
                        text: GIS.i18n.table,
                        iconCls: 'gis-button-icon-table',
                        toggleGroup: 'module',
                        menu: {},
                        handler: function(b) {
                            console.log("table handler");
                            /*
                            b.menu = Ext.create('Ext.menu.Menu', {
                                closeAction: 'destroy',
                                shadow: false,
                                showSeparator: false,
                                items: [
                                    {
                                        text: GIS.i18n.go_to_pivot_tables + '&nbsp;&nbsp;',
                                        cls: 'gis-menu-item-noicon',
                                        listeners: {
                                            render: function(b) {
                                                this.getEl().dom.addEventListener('click', function(e) {
                                                    if (!b.disabled) {
                                                        if (e.button === 0 && !e.ctrlKey) {
                                                            window.location.href = gis.init.contextPath + '/dhis-web-pivot';
                                                        }
                                                        else if ((e.ctrlKey && Ext.Array.contains([0,1], e.button)) || (!e.ctrlKey && e.button === 1)) {
                                                            window.open(gis.init.contextPath + '/dhis-web-pivot', '_blank');
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    },
                                    '-',
                                    {
                                        text: GIS.i18n.open_this_map_as_table + '&nbsp;&nbsp;',
                                        cls: 'gis-menu-item-noicon',
                                        disabled: !(GIS.isSessionStorage && gis.util.layout.getAnalytical()),
                                        listeners: {
                                            render: function(b) {
                                                this.getEl().dom.addEventListener('click', function(e) {
                                                    if (!b.disabled && GIS.isSessionStorage) {
                                                        gis.util.layout.setSessionStorage('analytical', gis.util.layout.getAnalytical());

                                                        if (e.button === 0 && !e.ctrlKey) {
                                                            window.location.href = gis.init.contextPath + '/dhis-web-pivot/index.html?s=analytical';
                                                        }
                                                        else if ((e.ctrlKey && Ext.Array.contains([0,1], e.button)) || (!e.ctrlKey && e.button === 1)) {
                                                            window.open(gis.init.contextPath + '/dhis-web-pivot/index.html?s=analytical', '_blank');
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    },
                                    {
                                        text: GIS.i18n.open_last_table + '&nbsp;&nbsp;',
                                        cls: 'gis-menu-item-noicon',
                                        disabled: !(GIS.isSessionStorage && JSON.parse(sessionStorage.getItem('dhis2')) && JSON.parse(sessionStorage.getItem('dhis2'))['table']),
                                        listeners: {
                                            render: function(b) {
                                                this.getEl().dom.addEventListener('click', function(e) {
                                                    if (!b.disabled) {
                                                        if (e.button === 0 && !e.ctrlKey) {
                                                            window.location.href = gis.init.contextPath + '/dhis-web-pivot/index.html?s=table';
                                                        }
                                                        else if ((e.ctrlKey && Ext.Array.contains([0,1], e.button)) || (!e.ctrlKey && e.button === 1)) {
                                                            window.open(gis.init.contextPath + '/dhis-web-pivot/index.html?s=table', '_blank');
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    }
                                ],
                                listeners: {
                                    show: function() {
                                        //gis.util.gui.window.setAnchorPosition(b.menu, b);
                                    },
                                    hide: function() {
                                        b.menu.destroy();
                                        defaultButton.toggle();
                                    },
                                    destroy: function(m) {
                                        b.menu = null;
                                    }
                                }
                            });

                            b.menu.show();
                            */
                        },
                        listeners: {
                            render: function() {
                                centerRegion.cmp.push(this);
                            }
                        }
                    });

                    a.push({
                        text: GIS.i18n.chart,
                        iconCls: 'gis-button-icon-chart',
                        toggleGroup: 'module',
                        menu: {},
                        handler: function(b) {
                            console.log('chart handler');

                            /*
                            b.menu = Ext.create('Ext.menu.Menu', {
                                closeAction: 'destroy',
                                shadow: false,
                                showSeparator: false,
                                items: [
                                    {
                                        text: GIS.i18n.go_to_charts + '&nbsp;&nbsp;',
                                        cls: 'gis-menu-item-noicon',
                                        listeners: {
                                            render: function(b) {
                                                this.getEl().dom.addEventListener('click', function(e) {
                                                    if (!b.disabled) {
                                                        if (e.button === 0 && !e.ctrlKey) {
                                                            window.location.href = gis.init.contextPath + '/dhis-web-visualizer';
                                                        }
                                                        else if ((e.ctrlKey && Ext.Array.contains([0,1], e.button)) || (!e.ctrlKey && e.button === 1)) {
                                                            window.open(gis.init.contextPath + '/dhis-web-visualizer', '_blank');
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    },
                                    '-',
                                    {
                                        text: GIS.i18n.open_this_map_as_chart + '&nbsp;&nbsp;',
                                        cls: 'gis-menu-item-noicon',
                                        disabled: !GIS.isSessionStorage || !gis.util.layout.getAnalytical(),
                                        listeners: {
                                            render: function(b) {
                                                this.getEl().dom.addEventListener('click', function(e) {
                                                    if (!b.disabled && GIS.isSessionStorage) {
                                                        gis.util.layout.setSessionStorage('analytical', gis.util.layout.getAnalytical());

                                                        if (e.button === 0 && !e.ctrlKey) {
                                                            window.location.href = gis.init.contextPath + '/dhis-web-visualizer/index.html?s=analytical';
                                                        }
                                                        else if ((e.ctrlKey && Ext.Array.contains([0,1], e.button)) || (!e.ctrlKey && e.button === 1)) {
                                                            window.open(gis.init.contextPath + '/dhis-web-visualizer/index.html?s=analytical', '_blank');
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    },
                                    {
                                        text: GIS.i18n.open_last_chart + '&nbsp;&nbsp;',
                                        cls: 'gis-menu-item-noicon',
                                        disabled: !(GIS.isSessionStorage && JSON.parse(sessionStorage.getItem('dhis2')) && JSON.parse(sessionStorage.getItem('dhis2'))['chart']),
                                        listeners: {
                                            render: function(b) {
                                                this.getEl().dom.addEventListener('click', function(e) {
                                                    if (!b.disabled) {
                                                        if (e.button === 0 && !e.ctrlKey) {
                                                            window.location.href = gis.init.contextPath + '/dhis-web-visualizer/index.html?s=chart';
                                                        }
                                                        else if ((e.ctrlKey && Ext.Array.contains([0,1], e.button)) || (!e.ctrlKey && e.button === 1)) {
                                                            window.open(gis.init.contextPath + '/dhis-web-visualizer/index.html?s=chart', '_blank');
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    }
                                ],
                                listeners: {
                                    show: function() {
                                        gis.util.gui.window.setAnchorPosition(b.menu, b);
                                    },
                                    hide: function() {
                                        b.menu.destroy();
                                        defaultButton.toggle();
                                    },
                                    destroy: function(m) {
                                        b.menu = null;
                                    }
                                }
                            });

                            b.menu.show();
                            */
                        },
                        listeners: {
                            render: function() {
                                centerRegion.cmp.push(this);
                            }
                        }
                    });

                    a.push(defaultButton);

                    a.push({
                        xtype: 'tbseparator',
                        height: 18,
                        style: 'border-color: transparent #d1d1d1 transparent transparent; margin-right: 6px; margin-left: 3px',
                        listeners: {
                            render: function() {
                                centerRegion.cmp.push(this);
                            }
                        }
                    });

                    a.push(aboutButton);

                    a.push({
                        xtype: 'button',
                        text: GIS.i18n.home,
                        handler: function() {
                            window.location.href = '../dhis-web-commons-about/redirect.action';
                        }
                    });

                    a.push(resizeButton);

                    return a;
                }()
            }
        });

        var eastRegion = Ext.create('Ext.panel.Panel', {
            region: 'east',
            layout: 'anchor',
            width: 200,
            preventHeader: true,
            collapsible: true,
            collapseMode: 'mini',
            items: function() {
                var a = [];

                //layersPanel = GIS.app.LayersPanel();

                a.push({
                    title: GIS.i18n.layer_stack_transparency,
                    bodyStyle: 'padding: 3px 2px 2px 5px; border:0 none; border-bottom: 1px solid #d0d0d0; border-top: 1px solid #d0d0d0',
                    style: 'border:0 none',
                    //items: layersPanel,
                    collapsible: true,
                    animCollapse: false
                });

                a.push({
                    title: GIS.i18n.facility_layer_legend,
                    bodyStyle: 'padding: 5px 6px 3px; border: 0 none; border-bottom: 1px solid #d0d0d0; border-top: 1px solid #d0d0d0',
                    collapsible: true,
                    collapsed: true,
                    animCollapse: false,
                    listeners: {
                        added: function() {
                            gis.layer.facility.legendPanel = this;
                        }
                    }
                });

                a.push({
                    title: GIS.i18n.thematic_layer_1_legend,
                    bodyStyle: 'padding: 4px 6px 6px; border: 0 none; border-bottom: 1px solid #d0d0d0; border-top: 1px solid #d0d0d0',
                    collapsible: true,
                    collapsed: true,
                    animCollapse: false,
                    listeners: {
                        added: function() {
                            gis.layer.thematic1.legendPanel = this;
                        }
                    }
                });

                a.push({
                    title: GIS.i18n.thematic_layer_2_legend,
                    bodyStyle: 'padding: 4px 6px 6px; border: 0 none; border-bottom: 1px solid #d0d0d0; border-top: 1px solid #d0d0d0',
                    collapsible: true,
                    collapsed: true,
                    animCollapse: false,
                    listeners: {
                        added: function() {
                            gis.layer.thematic2.legendPanel = this;
                        }
                    }
                });

                a.push({
                    title: GIS.i18n.thematic_layer_3_legend,
                    bodyStyle: 'padding: 4px 6px 6px; border: 0 none; border-bottom: 1px solid #d0d0d0',
                    collapsible: true,
                    collapsed: true,
                    animCollapse: false,
                    listeners: {
                        added: function() {
                            gis.layer.thematic3.legendPanel = this;
                        }
                    }
                });

                a.push({
                    title: GIS.i18n.thematic_layer_4_legend,
                    bodyStyle: 'padding: 4px 6px 6px; border: 0 none',
                    collapsible: true,
                    collapsed: true,
                    animCollapse: false,
                    listeners: {
                        added: function() {
                            gis.layer.thematic4.legendPanel = this;
                        }
                    }
                });

                return a;
            }(),
            listeners: {
                collapse: function() {
                    resizeButton.setText('<<<');
                },
                expand: function() {
                    resizeButton.setText('>>>');
                }
            }
        });


        var onRender = function(vp) {
            // gis.olmap.mask = Ext.create('Ext.LoadMask', centerRegion, {
            gis.mask = Ext.create('Ext.LoadMask', centerRegion, { // TODO
                msg: 'Loading'
            });
        };

        var afterRender = function() {

            // TODO: Add code


            var initEl = document.getElementById('init');
            initEl.parentNode.removeChild(initEl);

            Ext.getBody().setStyle('background', '#fff');
            Ext.getBody().setStyle('opacity', 0);

            // fade in
            Ext.defer( function() {
                Ext.getBody().fadeIn({
                    duration: 600
                });
            }, 300 );
        };

        var viewport = Ext.create('Ext.container.Viewport', {
            id: 'viewport',
            layout: 'border',
            //eastRegion: eastRegion,
            //centerRegion: centerRegion,
            //downloadButton: downloadButton,
            //shareButton: shareButton,
            //aboutButton: aboutButton,
            //layersPanel: layersPanel,
            items: [
                centerRegion,
                eastRegion
            ],
            listeners: {
                render: function() {
                    onRender(this);
                },
                afterrender: function() {
                    afterRender();
                }
            }
        });

        return viewport;
    };


    // Initialize
    (function() {
        var requests = [],
            callbacks = 0,
            init = {
                user: {},
                systemSettings: {},
                extensions: {}
            },
            fn;

        fn = function() {
            if (++callbacks === requests.length) {

                // instance
                gis = GIS.core.getInstance(init);

                // ux
                // GIS.app.createExtensions(); // TODO

                // extend instance
                // GIS.app.extendInstance(gis); // TODO

                // TODO: Missing Google Maps code

                // viewport
                gis.viewport = createViewport();
            }
        };

        // dhis2
        dhis2.util.namespace('dhis2.gis');

        dhis2.gis.store = dhis2.gis.store || new dhis2.storage.Store({
            name: 'dhis2',
            adapters: [dhis2.storage.IndexedDBAdapter, dhis2.storage.DomSessionStorageAdapter, dhis2.storage.InMemoryAdapter],
            objectStores: ['optionSets']
        });

        // TODO: Missing Google Maps code

        // requests
        Ext.Ajax.request({
            url: 'manifest.webapp',
            success: function(r) {
                var context = Ext.decode(r.responseText).activities.dhis;

                init.contextPath = context.href;

                if (context.auth) {
                    Ext.Ajax.defaultHeaders = {
                        'Authorization': 'Basic ' + btoa(context.auth)
                    };
                }

                // system info
                Ext.Ajax.request({
                    url: init.contextPath + '/api/system/info.json',
                    success: function(r) {
                        init.systemInfo = Ext.decode(r.responseText);
                        init.contextPath = init.systemInfo.contextPath || init.contextPath;

                        // date, calendar
                        Ext.Ajax.request({
                            url: init.contextPath + '/api/systemSettings.json?key=keyCalendar&key=keyDateFormat',
                            success: function(r) {
                                var systemSettings = Ext.decode(r.responseText);
                                init.systemInfo.dateFormat = Ext.isString(systemSettings.keyDateFormat) ? systemSettings.keyDateFormat.toLowerCase() : 'yyyy-mm-dd';
                                init.systemInfo.calendar = systemSettings.keyCalendar;

                                // user-account
                                Ext.Ajax.request({
                                    url: init.contextPath + '/api/me/user-account.json',
                                    success: function (r) {
                                        init.userAccount = Ext.decode(r.responseText);

                                        // init
                                        var defaultKeyUiLocale = 'en',
                                            defaultKeyAnalysisDisplayProperty = 'displayName',
                                            displayPropertyMap = {
                                                'name': 'displayName',
                                                'displayName': 'displayName',
                                                'shortName': 'displayShortName',
                                                'displayShortName': 'displayShortName'
                                            },
                                            namePropertyUrl,
                                            contextPath,
                                            keyUiLocale,
                                            dateFormat;

                                        init.userAccount.settings.keyUiLocale = init.userAccount.settings.keyUiLocale || defaultKeyUiLocale;
                                        init.userAccount.settings.keyAnalysisDisplayProperty = displayPropertyMap[init.userAccount.settings.keyAnalysisDisplayProperty] || defaultKeyAnalysisDisplayProperty;

                                        // local vars
                                        contextPath = init.contextPath;
                                        keyUiLocale = init.userAccount.settings.keyUiLocale;
                                        keyAnalysisDisplayProperty = init.userAccount.settings.keyAnalysisDisplayProperty;
                                        namePropertyUrl = keyAnalysisDisplayProperty + '|rename(name)';
                                        dateFormat = init.systemInfo.dateFormat;

                                        init.namePropertyUrl = namePropertyUrl;

                                        // calendar
                                        (function() {
                                            var dhis2PeriodUrl = 'dhis2/dhis2.period.js',
                                                defaultCalendarId = 'gregorian',
                                                calendarIdMap = {'iso8601': defaultCalendarId},
                                                calendarId = calendarIdMap[init.systemInfo.calendar] || init.systemInfo.calendar || defaultCalendarId,
                                                calendarIds = ['coptic', 'ethiopian', 'islamic', 'julian', 'nepali', 'thai'],
                                                calendarScriptUrl,
                                                createGenerator;

                                            // calendar
                                            createGenerator = function() {
                                                init.calendar = $.calendars.instance(calendarId);
                                                init.periodGenerator = new dhis2.period.PeriodGenerator(init.calendar, init.systemInfo.dateFormat);
                                            };

                                            if (Ext.Array.contains(calendarIds, calendarId)) {
                                                calendarScriptUrl = 'dhis2/jquery.calendars.' + calendarId + '.min.js';

                                                Ext.Loader.injectScriptElement(calendarScriptUrl, function() {
                                                    Ext.Loader.injectScriptElement(dhis2PeriodUrl, createGenerator);
                                                });
                                            }
                                            else {
                                                Ext.Loader.injectScriptElement(dhis2PeriodUrl, createGenerator);
                                            }
                                        }());

                                        // i18n
                                        requests.push({
                                            url: 'i18n/i18n_app.properties',
                                            success: function(r) {
                                                GIS.i18n = dhis2.util.parseJavaProperties(r.responseText);

                                                if (keyUiLocale === defaultKeyUiLocale) {
                                                    fn();
                                                }
                                                else {
                                                    Ext.Ajax.request({
                                                        url: 'i18n/i18n_app_' + keyUiLocale + '.properties',
                                                        success: function(r) {
                                                            Ext.apply(GIS.i18n, dhis2.util.parseJavaProperties(r.responseText));
                                                        },
                                                        failure: function() {
                                                            console.log('No translations found for system locale (' + keyUiLocale + ')');
                                                        },
                                                        callback: function() {
                                                            fn();
                                                        }
                                                    });
                                                }
                                            },
                                            failure: function() {
                                                Ext.Ajax.request({
                                                    url: 'i18n/i18n_app_' + keyUiLocale + '.properties',
                                                    success: function(r) {
                                                        GIS.i18n = dhis2.util.parseJavaProperties(r.responseText);
                                                    },
                                                    failure: function() {
                                                        alert('No translations found for system locale (' + keyUiLocale + ') or default locale (' + defaultKeyUiLocale + ').');
                                                    },
                                                    callback: fn
                                                });
                                            }
                                        });

                                        // root nodes
                                        requests.push({
                                            url: contextPath + '/api/organisationUnits.json?userDataViewFallback=true&paging=false&fields=id,' + namePropertyUrl + ',children[id,' + namePropertyUrl + ']',
                                            success: function(r) {
                                                init.rootNodes = Ext.decode(r.responseText).organisationUnits || [];
                                                fn();
                                            }
                                        });

                                        // organisation unit levels
                                        requests.push({
                                            url: contextPath + '/api/organisationUnitLevels.json?fields=id,displayName|rename(name),level&paging=false',
                                            success: function(r) {
                                                init.organisationUnitLevels = Ext.decode(r.responseText).organisationUnitLevels || [];

                                                if (!init.organisationUnitLevels.length) {
                                                    alert('No organisation unit levels');
                                                }

                                                fn();
                                            }
                                        });

                                        // user orgunits and children
                                        requests.push({
                                            url: contextPath + '/api/organisationUnits.json?userOnly=true&fields=id,' + namePropertyUrl + ',children[id,' + namePropertyUrl + ']&paging=false',
                                            success: function(r) {
                                                var organisationUnits = Ext.decode(r.responseText).organisationUnits || [],
                                                    ou = [],
                                                    ouc = [];

                                                if (organisationUnits.length) {
                                                    for (var i = 0, org; i < organisationUnits.length; i++) {
                                                        org = organisationUnits[i];

                                                        ou.push(org.id);

                                                        if (org.children) {
                                                            ouc = Ext.Array.clean(ouc.concat(Ext.Array.pluck(org.children, 'id') || []));
                                                        }
                                                    }

                                                    init.user = init.user || {};
                                                    init.user.ou = ou;
                                                    init.user.ouc = ouc;
                                                }
                                                else {
                                                    alert('User is not assigned to any organisation units');
                                                }

                                                fn();
                                            }
                                        });

                                        // admin
                                        requests.push({
                                            url: init.contextPath + '/api/me/authorization/F_GIS_ADMIN',
                                            success: function(r) {
                                                init.user.isAdmin = (r.responseText === 'true');
                                                fn();
                                            }
                                        });

                                        // indicator groups
                                        requests.push({
                                            url: init.contextPath + '/api/indicatorGroups.json?fields=id,displayName|rename(name)&paging=false',
                                            success: function(r) {
                                                init.indicatorGroups = Ext.decode(r.responseText).indicatorGroups || [];
                                                fn();
                                            }
                                        });

                                        // data element groups
                                        requests.push({
                                            url: init.contextPath + '/api/dataElementGroups.json?fields=id,' + namePropertyUrl + '&paging=false',
                                            success: function(r) {
                                                init.dataElementGroups = Ext.decode(r.responseText).dataElementGroups || [];
                                                fn();
                                            }
                                        });

                                        // infrastructural indicator group
                                        requests.push({
                                            url: init.contextPath + '/api/configuration/infrastructuralIndicators.json',
                                            success: function(r) {
                                                var obj = Ext.decode(r.responseText);
                                                init.systemSettings.infrastructuralIndicatorGroup = Ext.isObject(obj) ? obj : null;

                                                if (!Ext.isObject(obj)) {
                                                    Ext.Ajax.request({
                                                        url: init.contextPath + '/api/indicatorGroups.json?fields=id,displayName|rename(name),indicators[id,' + namePropertyUrl + ']&pageSize=1',
                                                        success: function(r) {
                                                            r = Ext.decode(r.responseText);
                                                            init.systemSettings.infrastructuralIndicatorGroup = r.indicatorGroups ? r.indicatorGroups[0] : null;
                                                        },
                                                        callback: fn
                                                    });
                                                }
                                                else {
                                                    fn();
                                                }
                                            }
                                        });

                                        // infrastructural data element group
                                        requests.push({
                                            url: init.contextPath + '/api/configuration/infrastructuralDataElements.json',
                                            success: function(r) {
                                                var obj = Ext.decode(r.responseText);
                                                init.systemSettings.infrastructuralDataElementGroup = Ext.isObject(obj) ? obj : null;

                                                if (!Ext.isObject(obj)) {
                                                    Ext.Ajax.request({
                                                        url: init.contextPath + '/api/dataElementGroups.json?fields=id,' + namePropertyUrl + ',dataElements[id,' + namePropertyUrl + ']&pageSize=1',
                                                        success: function(r) {
                                                            r = Ext.decode(r.responseText);
                                                            init.systemSettings.infrastructuralDataElementGroup = r.dataElementGroups ? r.dataElementGroups[0] : null;
                                                        },
                                                        callback: fn
                                                    });
                                                }
                                                else {
                                                    fn();
                                                }
                                            }
                                        });

                                        // infrastructural period type
                                        requests.push({
                                            url: init.contextPath + '/api/configuration/infrastructuralPeriodType.json',
                                            success: function(r) {
                                                var obj = Ext.decode(r.responseText);

                                                init.systemSettings.infrastructuralPeriodType = Ext.isObject(obj) ? obj : {id: 'Yearly', code: 'Yearly', name: 'Yearly'};
                                                fn();
                                            }
                                        });

                                        // option sets
                                        requests.push({
                                            url: '.',
                                            disableCaching: false,
                                            success: function() {
                                                var store = dhis2.gis.store;

                                                store.open().done( function() {

                                                    // check if idb has any option sets
                                                    store.getKeys('optionSets').done( function(keys) {
                                                        if (keys.length === 0) {
                                                            Ext.Ajax.request({
                                                                url: contextPath + '/api/optionSets.json?fields=id,displayName|rename(name),version,options[code,displayName|rename(name)]&paging=false',
                                                                success: function(r) {
                                                                    var sets = Ext.decode(r.responseText).optionSets;

                                                                    if (sets.length) {
                                                                        store.setAll('optionSets', sets).done(fn);
                                                                    }
                                                                    else {
                                                                        fn();
                                                                    }
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            Ext.Ajax.request({
                                                                url: contextPath + '/api/optionSets.json?fields=id,version&paging=false',
                                                                success: function(r) {
                                                                    var optionSets = Ext.decode(r.responseText).optionSets || [],
                                                                        ids = [],
                                                                        url = '',
                                                                        callbacks = 0,
                                                                        checkOptionSet,
                                                                        updateStore;

                                                                    updateStore = function() {
                                                                        if (++callbacks === optionSets.length) {
                                                                            if (!ids.length) {
                                                                                fn();
                                                                                return;
                                                                            }

                                                                            for (var i = 0; i < ids.length; i++) {
                                                                                url += '&filter=id:eq:' + ids[i];
                                                                            }

                                                                            Ext.Ajax.request({
                                                                                url: contextPath + '/api/optionSets.json?fields=id,displayName|rename(name),version,options[code,displayName|rename(name)]&paging=false' + url,
                                                                                success: function(r) {
                                                                                    var sets = Ext.decode(r.responseText).optionSets;

                                                                                    store.setAll('optionSets', sets).done(fn);
                                                                                }
                                                                            });
                                                                        }
                                                                    };

                                                                    registerOptionSet = function(optionSet) {
                                                                        store.get('optionSets', optionSet.id).done( function(obj) {
                                                                            if (!Ext.isObject(obj) || obj.version !== optionSet.version) {
                                                                                ids.push(optionSet.id);
                                                                            }

                                                                            updateStore();
                                                                        });
                                                                    };

                                                                    if (optionSets.length) {
                                                                        for (var i = 0; i < optionSets.length; i++) {
                                                                            registerOptionSet(optionSets[i]);
                                                                        }
                                                                    }
                                                                    else {
                                                                        fn();
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    });
                                                });
                                            }
                                        });

                                        for (var i = 0; i < requests.length; i++) {
                                            Ext.Ajax.request(requests[i]);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }());
});