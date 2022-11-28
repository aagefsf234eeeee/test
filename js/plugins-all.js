// Check mobiles
function is_mobile() {
	return(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}
// Preload
$.fn.preload = function() {
	this.each(function() {
		$('<img/>')[0].src = this;
	});
};
/* SmoothScroll v0.9.9 | Licensed under the terms of the MIT license. | People involved - Balazs Galambosi: maintainer (CHANGELOG.txt) - Patrick Brunner (patrickb1991@gmail.com) - Michael Herf: ssc_pulse Algorithm*/
var ssc_framerate = 150;
var ssc_animtime = 500;
var ssc_stepsize = 150;
var ssc_pulseAlgorithm = true;
var ssc_pulseScale = 6;
var ssc_pulseNormalize = 1;
var ssc_keyboardsupport = true;
var ssc_arrowscroll = 50;
var ssc_frame = false;
var ssc_direction = {
	x: 0,
	y: 0
};
var ssc_initdone = false;
var ssc_fixedback = true;
var ssc_root = document.documentElement;
var ssc_activeElement;
var ssc_key = {
	left: 37,
	up: 38,
	right: 39,
	down: 40,
	spacebar: 32,
	pageup: 33,
	pagedown: 34,
	end: 35,
	home: 36
};

function ssc_init() {
	if(!document.body) {
		return;
	}
	var body = document.body;
	var html = document.documentElement;
	var windowHeight = window.innerHeight;
	var scrollHeight = body.scrollHeight;
	ssc_root = (document.compatMode.indexOf("CSS") >= 0) ? html : body;
	ssc_activeElement = body;
	ssc_initdone = true;
	if(top != self) {
		ssc_frame = true;
	} else {
		if(scrollHeight > windowHeight && (body.offsetHeight <= windowHeight || html.offsetHeight <= windowHeight)) {
			ssc_root.style.height = "auto";
			if(ssc_root.offsetHeight <= windowHeight) {
				var underlay = document.createElement("div");
				underlay.style.clear = "both";
				body.appendChild(underlay);
			}
		}
	}
	if(!ssc_fixedback) {
		body.style.backgroundAttachment = "scroll";
		html.style.backgroundAttachment = "scroll";
	}
	if(ssc_keyboardsupport) {
		ssc_addEvent("keydown", ssc_keydown);
	}
}
var ssc_que = [];
var ssc_pending = false;

function ssc_scrollArray(elem, left, top, delay) {
	delay || (delay = 1000);
	ssc_directionCheck(left, top);
	ssc_que.push({
		x: left,
		y: top,
		lastX: (left < 0) ? 0.99 : -0.99,
		lastY: (top < 0) ? 0.99 : -0.99,
		start: +new Date
	});
	if(ssc_pending) {
		return;
	}
	var step = function() {
		var now = +new Date;
		var scrollX = 0;
		var scrollY = 0;
		for(var i = 0; i < ssc_que.length; i++) {
			var item = ssc_que[i];
			var elapsed = now - item.start;
			var finished = (elapsed >= ssc_animtime);
			var position = (finished) ? 1 : elapsed / ssc_animtime;
			if(ssc_pulseAlgorithm) {
				position = ssc_pulse(position);
			}
			var x = (item.x * position - item.lastX) >> 0;
			var y = (item.y * position - item.lastY) >> 0;
			scrollX += x;
			scrollY += y;
			item.lastX += x;
			item.lastY += y;
			if(finished) {
				ssc_que.splice(i, 1);
				i--;
			}
		}
		if(left) {
			var lastLeft = elem.scrollLeft;
			elem.scrollLeft += scrollX;
			if(scrollX && elem.scrollLeft === lastLeft) {
				left = 0;
			}
		}
		if(top) {
			var lastTop = elem.scrollTop;
			elem.scrollTop += scrollY;
			if(scrollY && elem.scrollTop === lastTop) {
				top = 0;
			}
		}
		if(!left && !top) {
			ssc_que = [];
		}
		if(ssc_que.length) {
			setTimeout(step, delay / ssc_framerate + 1);
		} else {
			ssc_pending = false;
		}
	};
	setTimeout(step, 0);
	ssc_pending = true;
}

function ssc_wheel(event) {
	if(!ssc_initdone) {
		ssc_init();
	}
	var target = event.target;
	var overflowing = ssc_overflowingAncestor(target);
	if(!overflowing || event.defaultPrevented || ssc_isNodeName(ssc_activeElement, "embed") || (ssc_isNodeName(target, "embed") && /\.pdf/i.test(target.src))) {
		return true;
	}
	var deltaX = event.wheelDeltaX || 0;
	var deltaY = event.wheelDeltaY || 0;
	if(!deltaX && !deltaY) {
		deltaY = event.wheelDelta || 0;
	}
	if(Math.abs(deltaX) > 1.2) {
		deltaX *= ssc_stepsize / 120;
	}
	if(Math.abs(deltaY) > 1.2) {
		deltaY *= ssc_stepsize / 120;
	}
	ssc_scrollArray(overflowing, -deltaX, -deltaY);
	event.preventDefault();
}

function ssc_keydown(event) {
	var target = event.target;
	var modifier = event.ctrlKey || event.altKey || event.metaKey;
	if(/input|textarea|embed/i.test(target.nodeName) || target.isContentEditable || event.defaultPrevented || modifier) {
		return true;
	}
	if(ssc_isNodeName(target, "button") && event.keyCode === ssc_key.spacebar) {
		return true;
	}
	var shift, x = 0,
		y = 0;
	var elem = ssc_overflowingAncestor(ssc_activeElement);
	var clientHeight = elem.clientHeight;
	if(elem == document.body) {
		clientHeight = window.innerHeight;
	}
	switch(event.keyCode) {
		case ssc_key.up:
			y = -ssc_arrowscroll;
			break;
		case ssc_key.down:
			y = ssc_arrowscroll;
			break;
		case ssc_key.spacebar:
			shift = event.shiftKey ? 1 : -1;
			y = -shift * clientHeight * 0.9;
			break;
		case ssc_key.pageup:
			y = -clientHeight * 0.9;
			break;
		case ssc_key.pagedown:
			y = clientHeight * 0.9;
			break;
		case ssc_key.home:
			y = -elem.scrollTop;
			break;
		case ssc_key.end:
			var damt = elem.scrollHeight - elem.scrollTop - clientHeight;
			y = (damt > 0) ? damt + 10 : 0;
			break;
		case ssc_key.left:
			x = -ssc_arrowscroll;
			break;
		case ssc_key.right:
			x = ssc_arrowscroll;
			break;
		default:
			return true;
	}
	ssc_scrollArray(elem, x, y);
	event.preventDefault();
}

function ssc_mousedown(event) {
	ssc_activeElement = event.target;
}
var ssc_cache = {};
setInterval(function() {
	ssc_cache = {};
}, 10 * 1000);
var ssc_uniqueID = (function() {
	var i = 0;
	return function(el) {
		return el.ssc_uniqueID || (el.ssc_uniqueID = i++);
	};
})();

function ssc_setCache(elems, overflowing) {
	for(var i = elems.length; i--;) {
		ssc_cache[ssc_uniqueID(elems[i])] = overflowing;
	}
	return overflowing;
}

function ssc_overflowingAncestor(el) {
	var elems = [];
	var ssc_rootScrollHeight = ssc_root.scrollHeight;
	do {
		var cached = ssc_cache[ssc_uniqueID(el)];
		if(cached) {
			return ssc_setCache(elems, cached);
		}
		elems.push(el);
		if(ssc_rootScrollHeight === el.scrollHeight) {
			if(!ssc_frame || ssc_root.clientHeight + 10 < ssc_rootScrollHeight) {
				return ssc_setCache(elems, document.body);
			}
		} else {
			if(el.clientHeight + 10 < el.scrollHeight) {
				overflow = getComputedStyle(el, "").getPropertyValue("overflow");
				if(overflow === "scroll" || overflow === "auto") {
					return ssc_setCache(elems, el);
				}
			}
		}
	} while (el = el.parentNode);
}

function ssc_addEvent(type, fn, bubble) {
	window.addEventListener(type, fn, (bubble || false));
}

function ssc_removeEvent(type, fn, bubble) {
	window.removeEventListener(type, fn, (bubble || false));
}

function ssc_isNodeName(el, tag) {
	return el.nodeName.toLowerCase() === tag.toLowerCase();
}

function ssc_directionCheck(x, y) {
	x = (x > 0) ? 1 : -1;
	y = (y > 0) ? 1 : -1;
	if(ssc_direction.x !== x || ssc_direction.y !== y) {
		ssc_direction.x = x;
		ssc_direction.y = y;
		ssc_que = [];
	}
}

function ssc_pulse_(x) {
	var val, start, expx;
	x = x * ssc_pulseScale;
	if(x < 1) {
		val = x - (1 - Math.exp(-x));
	} else {
		start = Math.exp(-1);
		x -= 1;
		expx = 1 - Math.exp(-x);
		val = start + (expx * (1 - start));
	}
	return val * ssc_pulseNormalize;
}

function ssc_pulse(x) {
	if(x >= 1) {
		return 1;
	}
	if(x <= 0) {
		return 0;
	}
	if(ssc_pulseNormalize == 1) {
		ssc_pulseNormalize /= ssc_pulse_(1);
	}
	return ssc_pulse_(x);
}
var ie = navigator.userAgent.toLowerCase().match(/msie|Trident/i);
if(ie == null) {
	ssc_addEvent("mousedown", ssc_mousedown);
	ssc_addEvent("mousewheel", ssc_wheel);
	ssc_addEvent("load", ssc_init);
}(function($) {
	$.fn.appear = function(f, o) {
		var s = $.extend({
			one: true
		}, o);
		return this.each(function() {
			var t = $(this);
			t.appeared = false;
			if(!f) {
				t.trigger("appear", s.data);
				return;
			}
			var w = $(window);
			var c = function() {
				if(!t.is(":visible")) {
					t.appeared = false;
					return;
				}
				var a = w.scrollLeft();
				var b = w.scrollTop();
				var o = t.offset();
				var x = o.left;
				var y = o.top;
				if(y + t.height() >= b && y <= b + w.height() && x + t.width() >= a && x <= a + w.width()) {
					if(!t.appeared) {
						t.trigger("appear", s.data);
					}
				} else {
					t.appeared = false;
				}
			};
			var m = function() {
				t.appeared = true;
				if(s.one) {
					w.unbind("scroll", c);
					var i = $.inArray(c, $.fn.appear.checks);
					if(i >= 0) {
						$.fn.appear.checks.splice(i, 1);
					}
				}
				f.apply(this, arguments);
			};
			if(s.one) {
				t.one("appear", s.data, m);
			} else {
				t.bind("appear", s.data, m);
			}
			w.scroll(c);
			$.fn.appear.checks.push(c);
			(c)();
		});
	};
	$.extend($.fn.appear, {
		checks: [],
		timeout: null,
		checkAll: function() {
			var l = $.fn.appear.checks.length;
			if(l > 0) {
				while(l--) {
					($.fn.appear.checks[l])();
				}
			}
		},
		run: function() {
			if($.fn.appear.timeout) {
				clearTimeout($.fn.appear.timeout);
			}
			$.fn.appear.timeout = setTimeout($.fn.appear.checkAll, 20);
		}
	});
	$.each(["append", "prepend", "after", "before", "attr", "removeAttr", "addClass", "removeClass", "toggleClass", "remove", "css", "show", "hide"], function(i, n) {
		var u = $.fn[n];
		if(u) {
			$.fn[n] = function() {
				var r = u.apply(this, arguments);
				$.fn.appear.run();
				return r;
			};
		}
	});
})(jQuery);
/*
 * Placeholder plugin for jQuery
 * ---
 * Copyright 2010, Daniel Stocks (http://webcloud.se)
 * Released under the MIT, BSD, and GPL Licenses.
 */
(function(b) {
	function d(a) {
		this.input = a;
		a.attr("type") == "password" && this.handlePassword();
		b(a[0].form).submit(function() {
			if(a.hasClass("placeholder") && a[0].value == a.attr("placeholder")) a[0].value = ""
		})
	}
	d.prototype = {
		show: function(a) {
			if(this.input[0].value === "" || a && this.valueIsPlaceholder()) {
				if(this.isPassword) try {
					this.input[0].setAttribute("type", "text")
				} catch(b) {
					this.input.before(this.fakePassword.show()).hide()
				}
				this.input.addClass("placeholder");
				this.input[0].value = this.input.attr("placeholder")
			}
		},
		hide: function() {
			if(this.valueIsPlaceholder() && this.input.hasClass("placeholder") && (this.input.removeClass("placeholder"), this.input[0].value = "", this.isPassword)) {
				try {
					this.input[0].setAttribute("type", "password")
				} catch(a) {}
				this.input.show();
				this.input[0].focus()
			}
		},
		valueIsPlaceholder: function() {
			return this.input[0].value == this.input.attr("placeholder")
		},
		handlePassword: function() {
			var a = this.input;
			a.attr("realType", "password");
			this.isPassword = !0;
			if(b.browser.msie && a[0].outerHTML) {
				var c = b(a[0].outerHTML.replace(/type=(['"])?password\1/gi, "type=$1text$1"));
				this.fakePassword = c.val(a.attr("placeholder")).addClass("placeholder").focus(function() {
					a.trigger("focus");
					b(this).hide()
				});
				b(a[0].form).submit(function() {
					c.remove();
					a.show()
				})
			}
		}
	};
	var e = !!("placeholder" in document.createElement("input"));
	b.fn.placeholder = function() {
		return e ? this : this.each(function() {
			var a = b(this),
				c = new d(a);
			c.show(!0);
			a.focus(function() {
				c.hide()
			});
			a.blur(function() {
				c.show(!1)
			});
			b.browser.msie && (b(window).load(function() {
				a.val() && a.removeClass("placeholder");
				c.show(!0)
			}), a.focus(function() {
				if(this.value == "") {
					var a = this.createTextRange();
					a.collapse(!0);
					a.moveStart("character", 0);
					a.select()
				}
			}))
		})
	}
})(jQuery);
/* Owl Carousel */
! function(a, b, c, d) {
	function e(b, c) {
		this.settings = null, this.options = a.extend({}, e.Defaults, c), this.$element = a(b), this.drag = a.extend({}, m), this.state = a.extend({}, n), this.e = a.extend({}, o), this._plugins = {}, this._supress = {}, this._current = null, this._speed = null, this._coordinates = [], this._breakpoint = null, this._width = null, this._items = [], this._clones = [], this._mergers = [], this._invalidated = {}, this._pipe = [], a.each(e.Plugins, a.proxy(function(a, b) {
			this._plugins[a[0].toLowerCase() + a.slice(1)] = new b(this)
		}, this)), a.each(e.Pipe, a.proxy(function(b, c) {
			this._pipe.push({
				filter: c.filter,
				run: a.proxy(c.run, this)
			})
		}, this)), this.setup(), this.initialize()
	}

	function f(a) {
		if(a.touches !== d) return {
			x: a.touches[0].pageX,
			y: a.touches[0].pageY
		};
		if(a.touches === d) {
			if(a.pageX !== d) return {
				x: a.pageX,
				y: a.pageY
			};
			if(a.pageX === d) return {
				x: a.clientX,
				y: a.clientY
			}
		}
	}

	function g(a) {
		var b, d, e = c.createElement("div"),
			f = a;
		for(b in f)
			if(d = f[b], "undefined" != typeof e.style[d]) return e = null, [d, b];
		return [!1]
	}

	function h() {
		return g(["transition", "WebkitTransition", "MozTransition", "OTransition"])[1]
	}

	function i() {
		return g(["transform", "WebkitTransform", "MozTransform", "OTransform", "msTransform"])[0]
	}

	function j() {
		return g(["perspective", "webkitPerspective", "MozPerspective", "OPerspective", "MsPerspective"])[0]
	}

	function k() {
		return "ontouchstart" in b || !!navigator.msMaxTouchPoints
	}

	function l() {
		return b.navigator.msPointerEnabled
	}
	var m, n, o;
	m = {
		start: 0,
		startX: 0,
		startY: 0,
		current: 0,
		currentX: 0,
		currentY: 0,
		offsetX: 0,
		offsetY: 0,
		distance: null,
		startTime: 0,
		endTime: 0,
		updatedX: 0,
		targetEl: null
	}, n = {
		isTouch: !1,
		isScrolling: !1,
		isSwiping: !1,
		direction: !1,
		inMotion: !1
	}, o = {
		_onDragStart: null,
		_onDragMove: null,
		_onDragEnd: null,
		_transitionEnd: null,
		_resizer: null,
		_responsiveCall: null,
		_goToLoop: null,
		_checkVisibile: null
	}, e.Defaults = {
		items: 3,
		loop: !1,
		center: !1,
		mouseDrag: !0,
		touchDrag: !0,
		pullDrag: !0,
		freeDrag: !1,
		margin: 0,
		stagePadding: 0,
		merge: !1,
		mergeFit: !0,
		autoWidth: !1,
		startPosition: 0,
		rtl: !1,
		smartSpeed: 250,
		fluidSpeed: !1,
		dragEndSpeed: !1,
		responsive: {},
		responsiveRefreshRate: 200,
		responsiveBaseElement: b,
		responsiveClass: !1,
		fallbackEasing: "swing",
		info: !1,
		nestedItemSelector: !1,
		itemElement: "div",
		stageElement: "div",
		themeClass: "owl-theme",
		baseClass: "owl-carousel",
		itemClass: "owl-item",
		centerClass: "center",
		activeClass: "active"
	}, e.Width = {
		Default: "default",
		Inner: "inner",
		Outer: "outer"
	}, e.Plugins = {}, e.Pipe = [{
		filter: ["width", "items", "settings"],
		run: function(a) {
			a.current = this._items && this._items[this.relative(this._current)]
		}
	}, {
		filter: ["items", "settings"],
		run: function() {
			var a = this._clones,
				b = this.$stage.children(".cloned");
			(b.length !== a.length || !this.settings.loop && a.length > 0) && (this.$stage.children(".cloned").remove(), this._clones = [])
		}
	}, {
		filter: ["items", "settings"],
		run: function() {
			var a, b, c = this._clones,
				d = this._items,
				e = this.settings.loop ? c.length - Math.max(2 * this.settings.items, 4) : 0;
			for(a = 0, b = Math.abs(e / 2); b > a; a++) e > 0 ? (this.$stage.children().eq(d.length + c.length - 1).remove(), c.pop(), this.$stage.children().eq(0).remove(), c.pop()) : (c.push(c.length / 2), this.$stage.append(d[c[c.length - 1]].clone().addClass("cloned")), c.push(d.length - 1 - (c.length - 1) / 2), this.$stage.prepend(d[c[c.length - 1]].clone().addClass("cloned")))
		}
	}, {
		filter: ["width", "items", "settings"],
		run: function() {
			var a, b, c, d = this.settings.rtl ? 1 : -1,
				e = (this.width() / this.settings.items).toFixed(3),
				f = 0;
			for(this._coordinates = [], b = 0, c = this._clones.length + this._items.length; c > b; b++) a = this._mergers[this.relative(b)], a = this.settings.mergeFit && Math.min(a, this.settings.items) || a, f += (this.settings.autoWidth ? this._items[this.relative(b)].width() + this.settings.margin : e * a) * d, this._coordinates.push(f)
		}
	}, {
		filter: ["width", "items", "settings"],
		run: function() {
			var b, c, d = (this.width() / this.settings.items).toFixed(3),
				e = {
					width: Math.abs(this._coordinates[this._coordinates.length - 1]) + 2 * this.settings.stagePadding,
					"padding-left": this.settings.stagePadding || "",
					"padding-right": this.settings.stagePadding || ""
				};
			if(this.$stage.css(e), e = {
					width: this.settings.autoWidth ? "auto" : d - this.settings.margin
				}, e[this.settings.rtl ? "margin-left" : "margin-right"] = this.settings.margin, !this.settings.autoWidth && a.grep(this._mergers, function(a) {
					return a > 1
				}).length > 0)
				for(b = 0, c = this._coordinates.length; c > b; b++) e.width = Math.abs(this._coordinates[b]) - Math.abs(this._coordinates[b - 1] || 0) - this.settings.margin, this.$stage.children().eq(b).css(e);
			else this.$stage.children().css(e)
		}
	}, {
		filter: ["width", "items", "settings"],
		run: function(a) {
			a.current && this.reset(this.$stage.children().index(a.current))
		}
	}, {
		filter: ["position"],
		run: function() {
			this.animate(this.coordinates(this._current))
		}
	}, {
		filter: ["width", "position", "items", "settings"],
		run: function() {
			var a, b, c, d, e = this.settings.rtl ? 1 : -1,
				f = 2 * this.settings.stagePadding,
				g = this.coordinates(this.current()) + f,
				h = g + this.width() * e,
				i = [];
			for(c = 0, d = this._coordinates.length; d > c; c++) a = this._coordinates[c - 1] || 0, b = Math.abs(this._coordinates[c]) + f * e, (this.op(a, "<=", g) && this.op(a, ">", h) || this.op(b, "<", g) && this.op(b, ">", h)) && i.push(c);
			this.$stage.children("." + this.settings.activeClass).removeClass(this.settings.activeClass), this.$stage.children(":eq(" + i.join("), :eq(") + ")").addClass(this.settings.activeClass), this.settings.center && (this.$stage.children("." + this.settings.centerClass).removeClass(this.settings.centerClass), this.$stage.children().eq(this.current()).addClass(this.settings.centerClass))
		}
	}], e.prototype.initialize = function() {
		if(this.trigger("initialize"), this.$element.addClass(this.settings.baseClass).addClass(this.settings.themeClass).toggleClass("owl-rtl", this.settings.rtl), this.browserSupport(), this.settings.autoWidth && this.state.imagesLoaded !== !0) {
			var b, c, e;
			if(b = this.$element.find("img"), c = this.settings.nestedItemSelector ? "." + this.settings.nestedItemSelector : d, e = this.$element.children(c).width(), b.length && 0 >= e) return this.preloadAutoWidthImages(b), !1
		}
		this.$element.addClass("owl-loading"), this.$stage = a("<" + this.settings.stageElement + ' class="owl-stage"/>').wrap('<div class="owl-stage-outer">'), this.$element.append(this.$stage.parent()), this.replace(this.$element.children().not(this.$stage.parent())), this._width = this.$element.width(), this.refresh(), this.$element.removeClass("owl-loading").addClass("owl-loaded"), this.eventsCall(), this.internalEvents(), this.addTriggerableEvents(), this.trigger("initialized")
	}, e.prototype.setup = function() {
		var b = this.viewport(),
			c = this.options.responsive,
			d = -1,
			e = null;
		c ? (a.each(c, function(a) {
			b >= a && a > d && (d = Number(a))
		}), e = a.extend({}, this.options, c[d]), delete e.responsive, e.responsiveClass && this.$element.attr("class", function(a, b) {
			return b.replace(/\b owl-responsive-\S+/g, "")
		}).addClass("owl-responsive-" + d)) : e = a.extend({}, this.options), (null === this.settings || this._breakpoint !== d) && (this.trigger("change", {
			property: {
				name: "settings",
				value: e
			}
		}), this._breakpoint = d, this.settings = e, this.invalidate("settings"), this.trigger("changed", {
			property: {
				name: "settings",
				value: this.settings
			}
		}))
	}, e.prototype.optionsLogic = function() {
		this.$element.toggleClass("owl-center", this.settings.center), this.settings.loop && this._items.length < this.settings.items && (this.settings.loop = !1), this.settings.autoWidth && (this.settings.stagePadding = !1, this.settings.merge = !1)
	}, e.prototype.prepare = function(b) {
		var c = this.trigger("prepare", {
			content: b
		});
		return c.data || (c.data = a("<" + this.settings.itemElement + "/>").addClass(this.settings.itemClass).append(b)), this.trigger("prepared", {
			content: c.data
		}), c.data
	}, e.prototype.update = function() {
		for(var b = 0, c = this._pipe.length, d = a.proxy(function(a) {
				return this[a]
			}, this._invalidated), e = {}; c > b;)(this._invalidated.all || a.grep(this._pipe[b].filter, d).length > 0) && this._pipe[b].run(e), b++;
		this._invalidated = {}
	}, e.prototype.width = function(a) {
		switch(a = a || e.Width.Default) {
			case e.Width.Inner:
			case e.Width.Outer:
				return this._width;
			default:
				return this._width - 2 * this.settings.stagePadding + this.settings.margin
		}
	}, e.prototype.refresh = function() {
		if(0 === this._items.length) return !1;
		(new Date).getTime();
		this.trigger("refresh"), this.setup(), this.optionsLogic(), this.$stage.addClass("owl-refresh"), this.update(), this.$stage.removeClass("owl-refresh"), this.state.orientation = b.orientation, this.watchVisibility(), this.trigger("refreshed")
	}, e.prototype.eventsCall = function() {
		this.e._onDragStart = a.proxy(function(a) {
			this.onDragStart(a)
		}, this), this.e._onDragMove = a.proxy(function(a) {
			this.onDragMove(a)
		}, this), this.e._onDragEnd = a.proxy(function(a) {
			this.onDragEnd(a)
		}, this), this.e._onResize = a.proxy(function(a) {
			this.onResize(a)
		}, this), this.e._transitionEnd = a.proxy(function(a) {
			this.transitionEnd(a)
		}, this), this.e._preventClick = a.proxy(function(a) {
			this.preventClick(a)
		}, this)
	}, e.prototype.onThrottledResize = function() {
		b.clearTimeout(this.resizeTimer), this.resizeTimer = b.setTimeout(this.e._onResize, this.settings.responsiveRefreshRate)
	}, e.prototype.onResize = function() {
		return this._items.length ? this._width === this.$element.width() ? !1 : this.trigger("resize").isDefaultPrevented() ? !1 : (this._width = this.$element.width(), this.invalidate("width"), this.refresh(), void this.trigger("resized")) : !1
	}, e.prototype.eventsRouter = function(a) {
		var b = a.type;
		"mousedown" === b || "touchstart" === b ? this.onDragStart(a) : "mousemove" === b || "touchmove" === b ? this.onDragMove(a) : "mouseup" === b || "touchend" === b ? this.onDragEnd(a) : "touchcancel" === b && this.onDragEnd(a)
	}, e.prototype.internalEvents = function() {
		var c = (k(), l());
		this.settings.mouseDrag ? (this.$stage.on("mousedown", a.proxy(function(a) {
			this.eventsRouter(a)
		}, this)), this.$stage.on("dragstart", function() {
			return !1
		}), this.$stage.get(0).onselectstart = function() {
			return !1
		}) : this.$element.addClass("owl-text-select-on"), this.settings.touchDrag && !c && this.$stage.on("touchstart touchcancel", a.proxy(function(a) {
			this.eventsRouter(a)
		}, this)), this.transitionEndVendor && this.on(this.$stage.get(0), this.transitionEndVendor, this.e._transitionEnd, !1), this.settings.responsive !== !1 && this.on(b, "resize", a.proxy(this.onThrottledResize, this))
	}, e.prototype.onDragStart = function(d) {
		var e, g, h, i;
		if(e = d.originalEvent || d || b.event, 3 === e.which || this.state.isTouch) return !1;
		if("mousedown" === e.type && this.$stage.addClass("owl-grab"), this.trigger("drag"), this.drag.startTime = (new Date).getTime(), this.speed(0), this.state.isTouch = !0, this.state.isScrolling = !1, this.state.isSwiping = !1, this.drag.distance = 0, g = f(e).x, h = f(e).y, this.drag.offsetX = this.$stage.position().left, this.drag.offsetY = this.$stage.position().top, this.settings.rtl && (this.drag.offsetX = this.$stage.position().left + this.$stage.width() - this.width() + this.settings.margin), this.state.inMotion && this.support3d) i = this.getTransformProperty(), this.drag.offsetX = i, this.animate(i), this.state.inMotion = !0;
		else if(this.state.inMotion && !this.support3d) return this.state.inMotion = !1, !1;
		this.drag.startX = g - this.drag.offsetX, this.drag.startY = h - this.drag.offsetY, this.drag.start = g - this.drag.startX, this.drag.targetEl = e.target || e.srcElement, this.drag.updatedX = this.drag.start, ("IMG" === this.drag.targetEl.tagName || "A" === this.drag.targetEl.tagName) && (this.drag.targetEl.draggable = !1), a(c).on("mousemove.owl.dragEvents mouseup.owl.dragEvents touchmove.owl.dragEvents touchend.owl.dragEvents", a.proxy(function(a) {
			this.eventsRouter(a)
		}, this))
	}, e.prototype.onDragMove = function(a) {
		var c, e, g, h, i, j;
		this.state.isTouch && (this.state.isScrolling || (c = a.originalEvent || a || b.event, e = f(c).x, g = f(c).y, this.drag.currentX = e - this.drag.startX, this.drag.currentY = g - this.drag.startY, this.drag.distance = this.drag.currentX - this.drag.offsetX, this.drag.distance < 0 ? this.state.direction = this.settings.rtl ? "right" : "left" : this.drag.distance > 0 && (this.state.direction = this.settings.rtl ? "left" : "right"), this.settings.loop ? this.op(this.drag.currentX, ">", this.coordinates(this.minimum())) && "right" === this.state.direction ? this.drag.currentX -= (this.settings.center && this.coordinates(0)) - this.coordinates(this._items.length) : this.op(this.drag.currentX, "<", this.coordinates(this.maximum())) && "left" === this.state.direction && (this.drag.currentX += (this.settings.center && this.coordinates(0)) - this.coordinates(this._items.length)) : (h = this.coordinates(this.settings.rtl ? this.maximum() : this.minimum()), i = this.coordinates(this.settings.rtl ? this.minimum() : this.maximum()), j = this.settings.pullDrag ? this.drag.distance / 5 : 0, this.drag.currentX = Math.max(Math.min(this.drag.currentX, h + j), i + j)), (this.drag.distance > 8 || this.drag.distance < -8) && (c.preventDefault !== d ? c.preventDefault() : c.returnValue = !1, this.state.isSwiping = !0), this.drag.updatedX = this.drag.currentX, (this.drag.currentY > 16 || this.drag.currentY < -16) && this.state.isSwiping === !1 && (this.state.isScrolling = !0, this.drag.updatedX = this.drag.start), this.animate(this.drag.updatedX)))
	}, e.prototype.onDragEnd = function(b) {
		var d, e, f;
		if(this.state.isTouch) {
			if("mouseup" === b.type && this.$stage.removeClass("owl-grab"), this.trigger("dragged"), this.drag.targetEl.removeAttribute("draggable"), this.state.isTouch = !1, this.state.isScrolling = !1, this.state.isSwiping = !1, 0 === this.drag.distance && this.state.inMotion !== !0) return this.state.inMotion = !1, !1;
			this.drag.endTime = (new Date).getTime(), d = this.drag.endTime - this.drag.startTime, e = Math.abs(this.drag.distance), (e > 3 || d > 300) && this.removeClick(this.drag.targetEl), f = this.closest(this.drag.updatedX), this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed), this.current(f), this.invalidate("position"), this.update(), this.settings.pullDrag || this.drag.updatedX !== this.coordinates(f) || this.transitionEnd(), this.drag.distance = 0, a(c).off(".owl.dragEvents")
		}
	}, e.prototype.removeClick = function(c) {
		this.drag.targetEl = c, a(c).on("click.preventClick", this.e._preventClick), b.setTimeout(function() {
			a(c).off("click.preventClick")
		}, 300)
	}, e.prototype.preventClick = function(b) {
		b.preventDefault ? b.preventDefault() : b.returnValue = !1, b.stopPropagation && b.stopPropagation(), a(b.target).off("click.preventClick")
	}, e.prototype.getTransformProperty = function() {
		var a, c;
		return a = b.getComputedStyle(this.$stage.get(0), null).getPropertyValue(this.vendorName + "transform"), a = a.replace(/matrix(3d)?\(|\)/g, "").split(","), c = 16 === a.length, c !== !0 ? a[4] : a[12]
	}, e.prototype.closest = function(b) {
		var c = -1,
			d = 30,
			e = this.width(),
			f = this.coordinates();
		return this.settings.freeDrag || a.each(f, a.proxy(function(a, g) {
			return b > g - d && g + d > b ? c = a : this.op(b, "<", g) && this.op(b, ">", f[a + 1] || g - e) && (c = "left" === this.state.direction ? a + 1 : a), -1 === c
		}, this)), this.settings.loop || (this.op(b, ">", f[this.minimum()]) ? c = b = this.minimum() : this.op(b, "<", f[this.maximum()]) && (c = b = this.maximum())), c
	}, e.prototype.animate = function(b) {
		this.trigger("translate"), this.state.inMotion = this.speed() > 0, this.support3d ? this.$stage.css({
			transform: "translate3d(" + b + "px,0px, 0px)",
			transition: this.speed() / 1e3 + "s"
		}) : this.state.isTouch ? this.$stage.css({
			left: b + "px"
		}) : this.$stage.animate({
			left: b
		}, this.speed() / 1e3, this.settings.fallbackEasing, a.proxy(function() {
			this.state.inMotion && this.transitionEnd()
		}, this))
	}, e.prototype.current = function(a) {
		if(a === d) return this._current;
		if(0 === this._items.length) return d;
		if(a = this.normalize(a), this._current !== a) {
			var b = this.trigger("change", {
				property: {
					name: "position",
					value: a
				}
			});
			b.data !== d && (a = this.normalize(b.data)), this._current = a, this.invalidate("position"), this.trigger("changed", {
				property: {
					name: "position",
					value: this._current
				}
			})
		}
		return this._current
	}, e.prototype.invalidate = function(a) {
		this._invalidated[a] = !0
	}, e.prototype.reset = function(a) {
		a = this.normalize(a), a !== d && (this._speed = 0, this._current = a, this.suppress(["translate", "translated"]), this.animate(this.coordinates(a)), this.release(["translate", "translated"]))
	}, e.prototype.normalize = function(b, c) {
		var e = c ? this._items.length : this._items.length + this._clones.length;
		return !a.isNumeric(b) || 1 > e ? d : b = this._clones.length ? (b % e + e) % e : Math.max(this.minimum(c), Math.min(this.maximum(c), b))
	}, e.prototype.relative = function(a) {
		return a = this.normalize(a), a -= this._clones.length / 2, this.normalize(a, !0)
	}, e.prototype.maximum = function(a) {
		var b, c, d, e = 0,
			f = this.settings;
		if(a) return this._items.length - 1;
		if(!f.loop && f.center) b = this._items.length - 1;
		else if(f.loop || f.center)
			if(f.loop || f.center) b = this._items.length + f.items;
			else {
				if(!f.autoWidth && !f.merge) throw "Can not detect maximum absolute position.";
				for(revert = f.rtl ? 1 : -1, c = this.$stage.width() - this.$element.width();
					(d = this.coordinates(e)) && !(d * revert >= c);) b = ++e
			} else b = this._items.length - f.items;
		return b
	}, e.prototype.minimum = function(a) {
		return a ? 0 : this._clones.length / 2
	}, e.prototype.items = function(a) {
		return a === d ? this._items.slice() : (a = this.normalize(a, !0), this._items[a])
	}, e.prototype.mergers = function(a) {
		return a === d ? this._mergers.slice() : (a = this.normalize(a, !0), this._mergers[a])
	}, e.prototype.clones = function(b) {
		var c = this._clones.length / 2,
			e = c + this._items.length,
			f = function(a) {
				return a % 2 === 0 ? e + a / 2 : c - (a + 1) / 2
			};
		return b === d ? a.map(this._clones, function(a, b) {
			return f(b)
		}) : a.map(this._clones, function(a, c) {
			return a === b ? f(c) : null
		})
	}, e.prototype.speed = function(a) {
		return a !== d && (this._speed = a), this._speed
	}, e.prototype.coordinates = function(b) {
		var c = null;
		return b === d ? a.map(this._coordinates, a.proxy(function(a, b) {
			return this.coordinates(b)
		}, this)) : (this.settings.center ? (c = this._coordinates[b], c += (this.width() - c + (this._coordinates[b - 1] || 0)) / 2 * (this.settings.rtl ? -1 : 1)) : c = this._coordinates[b - 1] || 0, c)
	}, e.prototype.duration = function(a, b, c) {
		return Math.min(Math.max(Math.abs(b - a), 1), 6) * Math.abs(c || this.settings.smartSpeed)
	}, e.prototype.to = function(c, d) {
		if(this.settings.loop) {
			var e = c - this.relative(this.current()),
				f = this.current(),
				g = this.current(),
				h = this.current() + e,
				i = 0 > g - h ? !0 : !1,
				j = this._clones.length + this._items.length;
			h < this.settings.items && i === !1 ? (f = g + this._items.length, this.reset(f)) : h >= j - this.settings.items && i === !0 && (f = g - this._items.length, this.reset(f)), b.clearTimeout(this.e._goToLoop), this.e._goToLoop = b.setTimeout(a.proxy(function() {
				this.speed(this.duration(this.current(), f + e, d)), this.current(f + e), this.update()
			}, this), 30)
		} else this.speed(this.duration(this.current(), c, d)), this.current(c), this.update()
	}, e.prototype.next = function(a) {
		a = a || !1, this.to(this.relative(this.current()) + 1, a)
	}, e.prototype.prev = function(a) {
		a = a || !1, this.to(this.relative(this.current()) - 1, a)
	}, e.prototype.transitionEnd = function(a) {
		return a !== d && (a.stopPropagation(), (a.target || a.srcElement || a.originalTarget) !== this.$stage.get(0)) ? !1 : (this.state.inMotion = !1, void this.trigger("translated"))
	}, e.prototype.viewport = function() {
		var d;
		if(this.options.responsiveBaseElement !== b) d = a(this.options.responsiveBaseElement).width();
		else if(b.innerWidth) d = b.innerWidth;
		else {
			if(!c.documentElement || !c.documentElement.clientWidth) throw "Can not detect viewport width.";
			d = c.documentElement.clientWidth
		}
		return d
	}, e.prototype.replace = function(b) {
		this.$stage.empty(), this._items = [], b && (b = b instanceof jQuery ? b : a(b)), this.settings.nestedItemSelector && (b = b.find("." + this.settings.nestedItemSelector)), b.filter(function() {
			return 1 === this.nodeType
		}).each(a.proxy(function(a, b) {
			b = this.prepare(b), this.$stage.append(b), this._items.push(b), this._mergers.push(1 * b.find("[data-merge]").andSelf("[data-merge]").attr("data-merge") || 1)
		}, this)), this.reset(a.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0), this.invalidate("items")
	}, e.prototype.add = function(a, b) {
		b = b === d ? this._items.length : this.normalize(b, !0), this.trigger("add", {
			content: a,
			position: b
		}), 0 === this._items.length || b === this._items.length ? (this.$stage.append(a), this._items.push(a), this._mergers.push(1 * a.find("[data-merge]").andSelf("[data-merge]").attr("data-merge") || 1)) : (this._items[b].before(a), this._items.splice(b, 0, a), this._mergers.splice(b, 0, 1 * a.find("[data-merge]").andSelf("[data-merge]").attr("data-merge") || 1)), this.invalidate("items"), this.trigger("added", {
			content: a,
			position: b
		})
	}, e.prototype.remove = function(a) {
		a = this.normalize(a, !0), a !== d && (this.trigger("remove", {
			content: this._items[a],
			position: a
		}), this._items[a].remove(), this._items.splice(a, 1), this._mergers.splice(a, 1), this.invalidate("items"), this.trigger("removed", {
			content: null,
			position: a
		}))
	}, e.prototype.addTriggerableEvents = function() {
		var b = a.proxy(function(b, c) {
			return a.proxy(function(a) {
				a.relatedTarget !== this && (this.suppress([c]), b.apply(this, [].slice.call(arguments, 1)), this.release([c]))
			}, this)
		}, this);
		a.each({
			next: this.next,
			prev: this.prev,
			to: this.to,
			destroy: this.destroy,
			refresh: this.refresh,
			replace: this.replace,
			add: this.add,
			remove: this.remove
		}, a.proxy(function(a, c) {
			this.$element.on(a + ".owl.carousel", b(c, a + ".owl.carousel"))
		}, this))
	}, e.prototype.watchVisibility = function() {
		function c(a) {
			return a.offsetWidth > 0 && a.offsetHeight > 0
		}

		function d() {
			c(this.$element.get(0)) && (this.$element.removeClass("owl-hidden"), this.refresh(), b.clearInterval(this.e._checkVisibile))
		}
		c(this.$element.get(0)) || (this.$element.addClass("owl-hidden"), b.clearInterval(this.e._checkVisibile), this.e._checkVisibile = b.setInterval(a.proxy(d, this), 500))
	}, e.prototype.preloadAutoWidthImages = function(b) {
		var c, d, e, f;
		c = 0, d = this, b.each(function(g, h) {
			e = a(h), f = new Image, f.onload = function() {
				c++, e.attr("src", f.src), e.css("opacity", 1), c >= b.length && (d.state.imagesLoaded = !0, d.initialize())
			}, f.src = e.attr("src") || e.attr("data-src") || e.attr("data-src-retina")
		})
	}, e.prototype.destroy = function() {
		this.$element.hasClass(this.settings.themeClass) && this.$element.removeClass(this.settings.themeClass), this.settings.responsive !== !1 && a(b).off("resize.owl.carousel"), this.transitionEndVendor && this.off(this.$stage.get(0), this.transitionEndVendor, this.e._transitionEnd);
		for(var d in this._plugins) this._plugins[d].destroy();
		(this.settings.mouseDrag || this.settings.touchDrag) && (this.$stage.off("mousedown touchstart touchcancel"), a(c).off(".owl.dragEvents"), this.$stage.get(0).onselectstart = function() {}, this.$stage.off("dragstart", function() {
			return !1
		})), this.$element.off(".owl"), this.$stage.children(".cloned").remove(), this.e = null, this.$element.removeData("owlCarousel"), this.$stage.children().contents().unwrap(), this.$stage.children().unwrap(), this.$stage.unwrap()
	}, e.prototype.op = function(a, b, c) {
		var d = this.settings.rtl;
		switch(b) {
			case "<":
				return d ? a > c : c > a;
			case ">":
				return d ? c > a : a > c;
			case ">=":
				return d ? c >= a : a >= c;
			case "<=":
				return d ? a >= c : c >= a
		}
	}, e.prototype.on = function(a, b, c, d) {
		a.addEventListener ? a.addEventListener(b, c, d) : a.attachEvent && a.attachEvent("on" + b, c)
	}, e.prototype.off = function(a, b, c, d) {
		a.removeEventListener ? a.removeEventListener(b, c, d) : a.detachEvent && a.detachEvent("on" + b, c)
	}, e.prototype.trigger = function(b, c, d) {
		var e = {
				item: {
					count: this._items.length,
					index: this.current()
				}
			},
			f = a.camelCase(a.grep(["on", b, d], function(a) {
				return a
			}).join("-").toLowerCase()),
			g = a.Event([b, "owl", d || "carousel"].join(".").toLowerCase(), a.extend({
				relatedTarget: this
			}, e, c));
		return this._supress[b] || (a.each(this._plugins, function(a, b) {
			b.onTrigger && b.onTrigger(g)
		}), this.$element.trigger(g), this.settings && "function" == typeof this.settings[f] && this.settings[f].apply(this, g)), g
	}, e.prototype.suppress = function(b) {
		a.each(b, a.proxy(function(a, b) {
			this._supress[b] = !0
		}, this))
	}, e.prototype.release = function(b) {
		a.each(b, a.proxy(function(a, b) {
			delete this._supress[b]
		}, this))
	}, e.prototype.browserSupport = function() {
		if(this.support3d = j(), this.support3d) {
			this.transformVendor = i();
			var a = ["transitionend", "webkitTransitionEnd", "transitionend", "oTransitionEnd"];
			this.transitionEndVendor = a[h()], this.vendorName = this.transformVendor.replace(/Transform/i, ""), this.vendorName = "" !== this.vendorName ? "-" + this.vendorName.toLowerCase() + "-" : ""
		}
		this.state.orientation = b.orientation
	}, a.fn.owlCarousel = function(b) {
		return this.each(function() {
			a(this).data("owlCarousel") || a(this).data("owlCarousel", new e(this, b))
		})
	}, a.fn.owlCarousel.Constructor = e
}(window.Zepto || window.jQuery, window, document),
function(a, b) {
	var c = function(b) {
		this._core = b, this._loaded = [], this._handlers = {
			"initialized.owl.carousel change.owl.carousel": a.proxy(function(b) {
				if(b.namespace && this._core.settings && this._core.settings.lazyLoad && (b.property && "position" == b.property.name || "initialized" == b.type))
					for(var c = this._core.settings, d = c.center && Math.ceil(c.items / 2) || c.items, e = c.center && -1 * d || 0, f = (b.property && b.property.value || this._core.current()) + e, g = this._core.clones().length, h = a.proxy(function(a, b) {
							this.load(b)
						}, this); e++ < d;) this.load(g / 2 + this._core.relative(f)), g && a.each(this._core.clones(this._core.relative(f++)), h)
			}, this)
		}, this._core.options = a.extend({}, c.Defaults, this._core.options), this._core.$element.on(this._handlers)
	};
	c.Defaults = {
		lazyLoad: !1
	}, c.prototype.load = function(c) {
		var d = this._core.$stage.children().eq(c),
			e = d && d.find(".owl-lazy");
		!e || a.inArray(d.get(0), this._loaded) > -1 || (e.each(a.proxy(function(c, d) {
			var e, f = a(d),
				g = b.devicePixelRatio > 1 && f.attr("data-src-retina") || f.attr("data-src");
			this._core.trigger("load", {
				element: f,
				url: g
			}, "lazy"), f.is("img") ? f.one("load.owl.lazy", a.proxy(function() {
				f.css("opacity", 1), this._core.trigger("loaded", {
					element: f,
					url: g
				}, "lazy")
			}, this)).attr("src", g) : (e = new Image, e.onload = a.proxy(function() {
				f.css({
					"background-image": "url(" + g + ")",
					opacity: "1"
				}), this._core.trigger("loaded", {
					element: f,
					url: g
				}, "lazy")
			}, this), e.src = g)
		}, this)), this._loaded.push(d.get(0)))
	}, c.prototype.destroy = function() {
		var a, b;
		for(a in this.handlers) this._core.$element.off(a, this.handlers[a]);
		for(b in Object.getOwnPropertyNames(this)) "function" != typeof this[b] && (this[b] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.Lazy = c
}(window.Zepto || window.jQuery, window, document),
function(a) {
	var b = function(c) {
		this._core = c, this._handlers = {
			"initialized.owl.carousel": a.proxy(function() {
				this._core.settings.autoHeight && this.update()
			}, this),
			"changed.owl.carousel": a.proxy(function(a) {
				this._core.settings.autoHeight && "position" == a.property.name && this.update()
			}, this),
			"loaded.owl.lazy": a.proxy(function(a) {
				this._core.settings.autoHeight && a.element.closest("." + this._core.settings.itemClass) === this._core.$stage.children().eq(this._core.current()) && this.update()
			}, this)
		}, this._core.options = a.extend({}, b.Defaults, this._core.options), this._core.$element.on(this._handlers)
	};
	b.Defaults = {
		autoHeight: !1,
		autoHeightClass: "owl-height"
	}, b.prototype.update = function() {
		this._core.$stage.parent().height(this._core.$stage.children().eq(this._core.current()).height()).addClass(this._core.settings.autoHeightClass)
	}, b.prototype.destroy = function() {
		var a, b;
		for(a in this._handlers) this._core.$element.off(a, this._handlers[a]);
		for(b in Object.getOwnPropertyNames(this)) "function" != typeof this[b] && (this[b] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.AutoHeight = b
}(window.Zepto || window.jQuery, window, document),
function(a, b, c) {
	var d = function(b) {
		this._core = b, this._videos = {}, this._playing = null, this._fullscreen = !1, this._handlers = {
			"resize.owl.carousel": a.proxy(function(a) {
				this._core.settings.video && !this.isInFullScreen() && a.preventDefault()
			}, this),
			"refresh.owl.carousel changed.owl.carousel": a.proxy(function() {
				this._playing && this.stop()
			}, this),
			"prepared.owl.carousel": a.proxy(function(b) {
				var c = a(b.content).find(".owl-video");
				c.length && (c.css("display", "none"), this.fetch(c, a(b.content)))
			}, this)
		}, this._core.options = a.extend({}, d.Defaults, this._core.options), this._core.$element.on(this._handlers), this._core.$element.on("click.owl.video", ".owl-video-play-icon", a.proxy(function(a) {
			this.play(a)
		}, this))
	};
	d.Defaults = {
		video: !1,
		videoHeight: !1,
		videoWidth: !1
	}, d.prototype.fetch = function(a, b) {
		var c = a.attr("data-vimeo-id") ? "vimeo" : "youtube",
			d = a.attr("data-vimeo-id") || a.attr("data-youtube-id"),
			e = a.attr("data-width") || this._core.settings.videoWidth,
			f = a.attr("data-height") || this._core.settings.videoHeight,
			g = a.attr("href");
		if(!g) throw new Error("Missing video URL.");
		if(d = g.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/), d[3].indexOf("youtu") > -1) c = "youtube";
		else {
			if(!(d[3].indexOf("vimeo") > -1)) throw new Error("Video URL not supported.");
			c = "vimeo"
		}
		d = d[6], this._videos[g] = {
			type: c,
			id: d,
			width: e,
			height: f
		}, b.attr("data-video", g), this.thumbnail(a, this._videos[g])
	}, d.prototype.thumbnail = function(b, c) {
		var d, e, f, g = c.width && c.height ? 'style="width:' + c.width + "px;height:" + c.height + 'px;"' : "",
			h = b.find("img"),
			i = "src",
			j = "",
			k = this._core.settings,
			l = function(a) {
				e = '<div class="owl-video-play-icon"></div>', d = k.lazyLoad ? '<div class="owl-video-tn ' + j + '" ' + i + '="' + a + '"></div>' : '<div class="owl-video-tn" style="opacity:1;background-image:url(' + a + ')"></div>', b.after(d), b.after(e)
			};
		return b.wrap('<div class="owl-video-wrapper"' + g + "></div>"), this._core.settings.lazyLoad && (i = "data-src", j = "owl-lazy"), h.length ? (l(h.attr(i)), h.remove(), !1) : void("youtube" === c.type ? (f = "http://img.youtube.com/vi/" + c.id + "/hqdefault.jpg", l(f)) : "vimeo" === c.type && a.ajax({
			type: "GET",
			url: "http://vimeo.com/api/v2/video/" + c.id + ".json",
			jsonp: "callback",
			dataType: "jsonp",
			success: function(a) {
				f = a[0].thumbnail_large, l(f)
			}
		}))
	}, d.prototype.stop = function() {
		this._core.trigger("stop", null, "video"), this._playing.find(".owl-video-frame").remove(), this._playing.removeClass("owl-video-playing"), this._playing = null
	}, d.prototype.play = function(b) {
		this._core.trigger("play", null, "video"), this._playing && this.stop();
		var c, d, e = a(b.target || b.srcElement),
			f = e.closest("." + this._core.settings.itemClass),
			g = this._videos[f.attr("data-video")],
			h = g.width || "100%",
			i = g.height || this._core.$stage.height();
		"youtube" === g.type ? c = '<iframe width="' + h + '" height="' + i + '" src="http://www.youtube.com/embed/' + g.id + "?autoplay=1&v=" + g.id + '" frameborder="0" allowfullscreen></iframe>' : "vimeo" === g.type && (c = '<iframe src="http://player.vimeo.com/video/' + g.id + '?autoplay=1" width="' + h + '" height="' + i + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'), f.addClass("owl-video-playing"), this._playing = f, d = a('<div style="height:' + i + "px; width:" + h + 'px" class="owl-video-frame">' + c + "</div>"), e.after(d)
	}, d.prototype.isInFullScreen = function() {
		var d = c.fullscreenElement || c.mozFullScreenElement || c.webkitFullscreenElement;
		return d && a(d).parent().hasClass("owl-video-frame") && (this._core.speed(0), this._fullscreen = !0), d && this._fullscreen && this._playing ? !1 : this._fullscreen ? (this._fullscreen = !1, !1) : this._playing && this._core.state.orientation !== b.orientation ? (this._core.state.orientation = b.orientation, !1) : !0
	}, d.prototype.destroy = function() {
		var a, b;
		this._core.$element.off("click.owl.video");
		for(a in this._handlers) this._core.$element.off(a, this._handlers[a]);
		for(b in Object.getOwnPropertyNames(this)) "function" != typeof this[b] && (this[b] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.Video = d
}(window.Zepto || window.jQuery, window, document),
function(a, b, c, d) {
	var e = function(b) {
		this.core = b, this.core.options = a.extend({}, e.Defaults, this.core.options), this.swapping = !0, this.previous = d, this.next = d, this.handlers = {
			"change.owl.carousel": a.proxy(function(a) {
				"position" == a.property.name && (this.previous = this.core.current(), this.next = a.property.value)
			}, this),
			"drag.owl.carousel dragged.owl.carousel translated.owl.carousel": a.proxy(function(a) {
				this.swapping = "translated" == a.type
			}, this),
			"translate.owl.carousel": a.proxy(function() {
				this.swapping && (this.core.options.animateOut || this.core.options.animateIn) && this.swap()
			}, this)
		}, this.core.$element.on(this.handlers)
	};
	e.Defaults = {
		animateOut: !1,
		animateIn: !1
	}, e.prototype.swap = function() {
		if(1 === this.core.settings.items && this.core.support3d) {
			this.core.speed(0);
			var b, c = a.proxy(this.clear, this),
				d = this.core.$stage.children().eq(this.previous),
				e = this.core.$stage.children().eq(this.next),
				f = this.core.settings.animateIn,
				g = this.core.settings.animateOut;
			this.core.current() !== this.previous && (g && (b = this.core.coordinates(this.previous) - this.core.coordinates(this.next), d.css({
				left: b + "px"
			}).addClass("animated owl-animated-out").addClass(g).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", c)), f && e.addClass("animated owl-animated-in").addClass(f).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", c))
		}
	}, e.prototype.clear = function(b) {
		a(b.target).css({
			left: ""
		}).removeClass("animated owl-animated-out owl-animated-in").removeClass(this.core.settings.animateIn).removeClass(this.core.settings.animateOut), this.core.transitionEnd()
	}, e.prototype.destroy = function() {
		var a, b;
		for(a in this.handlers) this.core.$element.off(a, this.handlers[a]);
		for(b in Object.getOwnPropertyNames(this)) "function" != typeof this[b] && (this[b] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.Animate = e
}(window.Zepto || window.jQuery, window, document),
function(a, b, c) {
	var d = function(b) {
		this.core = b, this.core.options = a.extend({}, d.Defaults, this.core.options), this.handlers = {
			"translated.owl.carousel refreshed.owl.carousel": a.proxy(function() {
				this.autoplay()
			}, this),
			"play.owl.autoplay": a.proxy(function(a, b, c) {
				this.play(b, c)
			}, this),
			"stop.owl.autoplay": a.proxy(function() {
				this.stop()
			}, this),
			"mouseover.owl.autoplay": a.proxy(function() {
				this.core.settings.autoplayHoverPause && this.pause()
			}, this),
			"mouseleave.owl.autoplay": a.proxy(function() {
				this.core.settings.autoplayHoverPause && this.autoplay()
			}, this)
		}, this.core.$element.on(this.handlers)
	};
	d.Defaults = {
		autoplay: !1,
		autoplayTimeout: 5e3,
		autoplayHoverPause: !1,
		autoplaySpeed: !1
	}, d.prototype.autoplay = function() {
		this.core.settings.autoplay && !this.core.state.videoPlay ? (b.clearInterval(this.interval), this.interval = b.setInterval(a.proxy(function() {
			this.play()
		}, this), this.core.settings.autoplayTimeout)) : b.clearInterval(this.interval)
	}, d.prototype.play = function() {
		return c.hidden === !0 || this.core.state.isTouch || this.core.state.isScrolling || this.core.state.isSwiping || this.core.state.inMotion ? void 0 : this.core.settings.autoplay === !1 ? void b.clearInterval(this.interval) : void this.core.next(this.core.settings.autoplaySpeed)
	}, d.prototype.stop = function() {
		b.clearInterval(this.interval)
	}, d.prototype.pause = function() {
		b.clearInterval(this.interval)
	}, d.prototype.destroy = function() {
		var a, c;
		b.clearInterval(this.interval);
		for(a in this.handlers) this.core.$element.off(a, this.handlers[a]);
		for(c in Object.getOwnPropertyNames(this)) "function" != typeof this[c] && (this[c] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.autoplay = d
}(window.Zepto || window.jQuery, window, document),
function(a) {
	"use strict";
	var b = function(c) {
		this._core = c, this._initialized = !1, this._pages = [], this._controls = {}, this._templates = [], this.$element = this._core.$element, this._overrides = {
			next: this._core.next,
			prev: this._core.prev,
			to: this._core.to
		}, this._handlers = {
			"prepared.owl.carousel": a.proxy(function(b) {
				this._core.settings.dotsData && this._templates.push(a(b.content).find("[data-dot]").andSelf("[data-dot]").attr("data-dot"))
			}, this),
			"add.owl.carousel": a.proxy(function(b) {
				this._core.settings.dotsData && this._templates.splice(b.position, 0, a(b.content).find("[data-dot]").andSelf("[data-dot]").attr("data-dot"))
			}, this),
			"remove.owl.carousel prepared.owl.carousel": a.proxy(function(a) {
				this._core.settings.dotsData && this._templates.splice(a.position, 1)
			}, this),
			"change.owl.carousel": a.proxy(function(a) {
				if("position" == a.property.name && !this._core.state.revert && !this._core.settings.loop && this._core.settings.navRewind) {
					var b = this._core.current(),
						c = this._core.maximum(),
						d = this._core.minimum();
					a.data = a.property.value > c ? b >= c ? d : c : a.property.value < d ? c : a.property.value
				}
			}, this),
			"changed.owl.carousel": a.proxy(function(a) {
				"position" == a.property.name && this.draw()
			}, this),
			"refreshed.owl.carousel": a.proxy(function() {
				this._initialized || (this.initialize(), this._initialized = !0), this._core.trigger("refresh", null, "navigation"), this.update(), this.draw(), this._core.trigger("refreshed", null, "navigation")
			}, this)
		}, this._core.options = a.extend({}, b.Defaults, this._core.options), this.$element.on(this._handlers)
	};
	b.Defaults = {
		nav: !1,
		navRewind: !0,
		navText: ["prev", "next"],
		navSpeed: !1,
		navElement: "div",
		navContainer: !1,
		navContainerClass: "owl-nav",
		navClass: ["owl-prev", "owl-next"],
		slideBy: 1,
		dotClass: "owl-dot",
		dotsClass: "owl-dots",
		dots: !0,
		dotsEach: !1,
		dotData: !1,
		dotsSpeed: !1,
		dotsContainer: !1,
		controlsClass: "owl-controls"
	}, b.prototype.initialize = function() {
		var b, c, d = this._core.settings;
		d.dotsData || (this._templates = [a("<div>").addClass(d.dotClass).append(a("<span>")).prop("outerHTML")]), d.navContainer && d.dotsContainer || (this._controls.$container = a("<div>").addClass(d.controlsClass).appendTo(this.$element)), this._controls.$indicators = d.dotsContainer ? a(d.dotsContainer) : a("<div>").hide().addClass(d.dotsClass).appendTo(this._controls.$container), this._controls.$indicators.on("click", "div", a.proxy(function(b) {
			var c = a(b.target).parent().is(this._controls.$indicators) ? a(b.target).index() : a(b.target).parent().index();
			b.preventDefault(), this.to(c, d.dotsSpeed)
		}, this)), b = d.navContainer ? a(d.navContainer) : a("<div>").addClass(d.navContainerClass).prependTo(this._controls.$container), this._controls.$next = a("<" + d.navElement + ">"), this._controls.$previous = this._controls.$next.clone(), this._controls.$previous.addClass(d.navClass[0]).html(d.navText[0]).hide().prependTo(b).on("click", a.proxy(function() {
			this.prev(d.navSpeed)
		}, this)), this._controls.$next.addClass(d.navClass[1]).html(d.navText[1]).hide().appendTo(b).on("click", a.proxy(function() {
			this.next(d.navSpeed)
		}, this));
		for(c in this._overrides) this._core[c] = a.proxy(this[c], this)
	}, b.prototype.destroy = function() {
		var a, b, c, d;
		for(a in this._handlers) this.$element.off(a, this._handlers[a]);
		for(b in this._controls) this._controls[b].remove();
		for(d in this.overides) this._core[d] = this._overrides[d];
		for(c in Object.getOwnPropertyNames(this)) "function" != typeof this[c] && (this[c] = null)
	}, b.prototype.update = function() {
		var a, b, c, d = this._core.settings,
			e = this._core.clones().length / 2,
			f = e + this._core.items().length,
			g = d.center || d.autoWidth || d.dotData ? 1 : d.dotsEach || d.items;
		if("page" !== d.slideBy && (d.slideBy = Math.min(d.slideBy, d.items)), d.dots || "page" == d.slideBy)
			for(this._pages = [], a = e, b = 0, c = 0; f > a; a++)(b >= g || 0 === b) && (this._pages.push({
				start: a - e,
				end: a - e + g - 1
			}), b = 0, ++c), b += this._core.mergers(this._core.relative(a))
	}, b.prototype.draw = function() {
		var b, c, d = "",
			e = this._core.settings,
			f = (this._core.$stage.children(), this._core.relative(this._core.current()));
		if(!e.nav || e.loop || e.navRewind || (this._controls.$previous.toggleClass("disabled", 0 >= f), this._controls.$next.toggleClass("disabled", f >= this._core.maximum())), this._controls.$previous.toggle(e.nav), this._controls.$next.toggle(e.nav), e.dots) {
			if(b = this._pages.length - this._controls.$indicators.children().length, e.dotData && 0 !== b) {
				for(c = 0; c < this._controls.$indicators.children().length; c++) d += this._templates[this._core.relative(c)];
				this._controls.$indicators.html(d)
			} else b > 0 ? (d = new Array(b + 1).join(this._templates[0]), this._controls.$indicators.append(d)) : 0 > b && this._controls.$indicators.children().slice(b).remove();
			this._controls.$indicators.find(".active").removeClass("active"), this._controls.$indicators.children().eq(a.inArray(this.current(), this._pages)).addClass("active")
		}
		this._controls.$indicators.toggle(e.dots)
	}, b.prototype.onTrigger = function(b) {
		var c = this._core.settings;
		b.page = {
			index: a.inArray(this.current(), this._pages),
			count: this._pages.length,
			size: c && (c.center || c.autoWidth || c.dotData ? 1 : c.dotsEach || c.items)
		}
	}, b.prototype.current = function() {
		var b = this._core.relative(this._core.current());
		return a.grep(this._pages, function(a) {
			return a.start <= b && a.end >= b
		}).pop()
	}, b.prototype.getPosition = function(b) {
		var c, d, e = this._core.settings;
		return "page" == e.slideBy ? (c = a.inArray(this.current(), this._pages), d = this._pages.length, b ? ++c : --c, c = this._pages[(c % d + d) % d].start) : (c = this._core.relative(this._core.current()), d = this._core.items().length, b ? c += e.slideBy : c -= e.slideBy), c
	}, b.prototype.next = function(b) {
		a.proxy(this._overrides.to, this._core)(this.getPosition(!0), b)
	}, b.prototype.prev = function(b) {
		a.proxy(this._overrides.to, this._core)(this.getPosition(!1), b)
	}, b.prototype.to = function(b, c, d) {
		var e;
		d ? a.proxy(this._overrides.to, this._core)(b, c) : (e = this._pages.length, a.proxy(this._overrides.to, this._core)(this._pages[(b % e + e) % e].start, c))
	}, a.fn.owlCarousel.Constructor.Plugins.Navigation = b
}(window.Zepto || window.jQuery, window, document),
function(a, b) {
	"use strict";
	var c = function(d) {
		this._core = d, this._hashes = {}, this.$element = this._core.$element, this._handlers = {
			"initialized.owl.carousel": a.proxy(function() {
				"URLHash" == this._core.settings.startPosition && a(b).trigger("hashchange.owl.navigation")
			}, this),
			"prepared.owl.carousel": a.proxy(function(b) {
				var c = a(b.content).find("[data-hash]").andSelf("[data-hash]").attr("data-hash");
				this._hashes[c] = b.content
			}, this)
		}, this._core.options = a.extend({}, c.Defaults, this._core.options), this.$element.on(this._handlers), a(b).on("hashchange.owl.navigation", a.proxy(function() {
			var a = b.location.hash.substring(1),
				c = this._core.$stage.children(),
				d = this._hashes[a] && c.index(this._hashes[a]) || 0;
			return a ? void this._core.to(d, !1, !0) : !1
		}, this))
	};
	c.Defaults = {
		URLhashListener: !1
	}, c.prototype.destroy = function() {
		var c, d;
		a(b).off("hashchange.owl.navigation");
		for(c in this._handlers) this._core.$element.off(c, this._handlers[c]);
		for(d in Object.getOwnPropertyNames(this)) "function" != typeof this[d] && (this[d] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.Hash = c
}(window.Zepto || window.jQuery, window, document);
/*! fancyBox v3 fancyapps.com | fancyapps.com/fancybox/#license */
! function(e, t, i, n) {
	"use strict";
	var o = i(e),
		a = i(t),
		r = i("html"),
		s = i.fancybox = function() {
			s.open.apply(this, arguments)
		},
		l = s.isTouch = t.createTouch !== n || e.ontouchstart !== n,
		c = function(e) {
			return e && e.hasOwnProperty && e instanceof i
		},
		d = function(e) {
			return e && "string" === i.type(e)
		},
		p = function(e) {
			return d(e) && e.indexOf("%") > 0
		},
		h = function(e, t) {
			var i = parseFloat(e, 10) || 0;
			return t && p(e) && (i = s.getViewport()[t] / 100 * i), Math.ceil(i)
		},
		f = function(e, t) {
			return h(e, t) + "px"
		},
		u = Date.now || function() {
			return +new Date
		},
		g = function(e) {
			var t = d(e) ? i(e) : e;
			if(t && t.length) {
				t.removeClass("fancybox-wrap").stop(!0).trigger("onReset").hide().unbind();
				try {
					t.find("iframe").unbind().attr("src", l ? "" : "//about:blank"), setTimeout(function() {
						if(t.empty().remove(), s.lock && !s.coming && !s.current) {
							var e, n;
							i(".fancybox-margin").removeClass("fancybox-margin"), e = o.scrollTop(), n = o.scrollLeft(), r.removeClass("fancybox-lock"), s.lock.remove(), s.lock = null, o.scrollTop(e).scrollLeft(n)
						}
					}, 150)
				} catch(n) {}
			}
		};
	i.extend(s, {
		version: "3.0.0",
		defaults: {
			theme: "default",
			padding: 15,
			margin: [30, 55, 30, 55],
			loop: !0,
			arrows: !0,
			closeBtn: !0,
			expander: !l,
			caption: {
				type: "outside"
			},
			overlay: {
				closeClick: !0,
				speedIn: 0,
				speedOut: 250,
				showEarly: !0,
				css: {}
			},
			helpers: {},
			width: 800,
			height: 450,
			minWidth: 100,
			minHeight: 100,
			maxWidth: 99999,
			maxHeight: 99999,
			aspectRatio: !1,
			fitToView: !0,
			autoHeight: !0,
			autoWidth: !0,
			autoResize: !0,
			autoCenter: !l,
			topRatio: .5,
			leftRatio: .5,
			openEffect: "elastic",
			openSpeed: 350,
			openEasing: "easeOutQuad",
			closeEffect: "elastic",
			closeSpeed: 350,
			closeEasing: "easeOutQuad",
			nextEffect: "elastic",
			nextSpeed: 350,
			nextEasing: "easeOutQuad",
			prevEffect: "elastic",
			prevSpeed: 350,
			prevEasing: "easeOutQuad",
			autoPlay: !1,
			playSpeed: 3e3,
			onCancel: i.noop,
			beforeLoad: i.noop,
			afterLoad: i.noop,
			beforeShow: i.noop,
			afterShow: i.noop,
			beforeClose: i.noop,
			afterClose: i.noop,
			ajax: {
				dataType: "html",
				headers: {
					"X-fancyBox": !0
				}
			},
			iframe: {
				scrolling: "auto",
				preload: !0
			},
			swf: {
				wmode: "transparent",
				allowfullscreen: "true",
				allowscriptaccess: "always"
			},
			keys: {
				next: {
					13: "left",
					34: "up",
					39: "left",
					40: "up"
				},
				prev: {
					8: "right",
					33: "down",
					37: "right",
					38: "down"
				},
				close: [27],
				play: [32],
				toggle: [70]
			},
			direction: {
				next: "left",
				prev: "right"
			},
			tpl: {
				wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-inner"></div></div>',
				iframe: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen allowtransparency="true"></iframe>',
				error: '<p class="fancybox-error">{{ERROR}}</p>',
				closeBtn: '<a title="{{CLOSE}}" class="fancybox-close" href="javascript:;"></a>',
				next: '<a title="{{NEXT}}" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
				prev: '<a title="{{PREV}}" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
			},
			locale: "en",
			locales: {
				en: {
					CLOSE: "Close",
					NEXT: "Next",
					PREV: "Previous",
					ERROR: "The requested content cannot be loaded. <br/> Please try again later.",
					EXPAND: "Display actual size",
					SHRINK: "Fit to the viewport",
					PLAY_START: "Start slideshow",
					PLAY_STOP: "Pause slideshow"
				},
				de: {
					CLOSE: "Schliessen",
					NEXT: "VorwГ¤rts",
					PREV: "ZurГјck",
					ERROR: "Die angeforderten Daten konnten nicht geladen werden. <br/> Bitte versuchen Sie es spГ¤ter nochmal.",
					EXPAND: "",
					SHRINK: "",
					PLAY_START: "",
					PLAY_STOP: ""
				}
			},
			index: 0,
			content: null,
			href: null,
			wrapCSS: "",
			modal: !1,
			locked: !0,
			preload: 3,
			mouseWheel: !0,
			scrolling: "auto",
			scrollOutside: !0
		},
		current: null,
		coming: null,
		group: [],
		index: 0,
		isActive: !1,
		isOpen: !1,
		isOpened: !1,
		isMaximized: !1,
		player: {
			timer: null,
			isActive: !1
		},
		ajaxLoad: null,
		imgPreload: null,
		helpers: {},
		open: function(e, t) {
			e && !1 !== s.close(!0) && (i.isPlainObject(t) || (t = {}), s.opts = i.extend(!0, {}, s.defaults, t), s.populate(e), s.group.length && s._start(s.opts.index))
		},
		populate: function(e) {
			var t = [];
			i.isArray(e) || (e = [e]), i.each(e, function(o, a) {
				var r, p, h, f, u, g = i.extend(!0, {}, s.opts);
				if(i.isPlainObject(a)) r = a;
				else if(d(a)) r = {
					href: a
				};
				else {
					if(!(c(a) || "object" === i.type(a) && a.nodeType)) return;
					p = i(a), r = i(p).get(0), r.href || (r = {
						href: a
					}), r = i.extend({
						href: p.data("fancybox-href") || p.attr("href") || r.href,
						title: p.data("fancybox-title") || p.attr("title") || r.title,
						type: p.data("fancybox-type"),
						element: p
					}, p.data("fancybox-options"))
				}
				r.type || !r.content && !r.href || (r.type = r.content ? "html" : s.guessType(p, r.href)), h = r.type || s.opts.type, ("image" === h || "swf" === h) && (g.autoWidth = g.autoHeight = !1, g.scrolling = "visible"), "image" === h && (g.aspectRatio = !0), "iframe" === h && (g.autoWidth = !1, g.scrolling = l ? "scroll" : "visible"), e.length < 2 && (g.margin = 30), r = i.extend(!0, {}, g, r), f = r.margin, u = r.padding, "number" === i.type(f) && (r.margin = [f, f, f, f]), "number" === i.type(u) && (r.padding = [u, u, u, u]), r.modal && i.extend(!0, r, {
					closeBtn: !1,
					closeClick: !1,
					nextClick: !1,
					arrows: !1,
					mouseWheel: !1,
					keys: null,
					overlay: {
						closeClick: !1
					}
				}), r.autoSize !== n && (r.autoWidth = r.autoHeight = !!r.autoSize), "auto" === r.width && (r.autoWidth = !0), "auto" === r.height && (r.autoHeight = !0), t.push(r)
			}), s.group = s.group.concat(t)
		},
		cancel: function() {
			var e = s.coming;
			e && !1 !== s.trigger("onCancel") && (s.hideLoading(), s.ajaxLoad && s.ajaxLoad.abort(), s.imgPreload && (s.imgPreload.onload = s.imgPreload.onerror = null), e.wrap && g(e.wrap), s.ajaxLoad = s.imgPreload = s.coming = null, s.current || s._afterZoomOut(e))
		},
		close: function(e) {
			e && "object" === i.type(e) && e.preventDefault(), s.cancel(), s.isActive && !s.coming && !1 !== s.trigger("beforeClose") && (s.unbind(), s.isClosing = !0, s.lock && s.lock.css("overflow", "hidden"), s.isOpen && e !== !0 ? (s.isOpen = s.isOpened = !1, s.transitions.close()) : s._afterZoomOut())
		},
		prev: function(e) {
			var t = s.current;
			t && s.jumpto(t.index - 1, d(e) ? e : t.direction.prev)
		},
		next: function(e) {
			var t = s.current;
			t && s.jumpto(t.index + 1, d(e) ? e : t.direction.next)
		},
		jumpto: function(e, t) {
			var i = s.current;
			s.coming && s.coming.index === e || (s.cancel(), i.index == e ? t = null : t || (t = i.direction[e > i.index ? "next" : "prev"]), s.direction = t, s._start(e))
		}
	}), i.extend(s, {
		guessType: function(e, t) {
			var i = e && e.prop("class") ? e.prop("class").match(/fancybox\.(\w+)/) : 0,
				n = !1;
			return i ? i[1] : (d(t) ? t.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp)((\?|#).*)?$)/i) ? n = "image" : t.match(/\.(swf)((\?|#).*)?$/i) ? n = "swf" : "#" === t.charAt(0) && (n = "inline") : d(e) && (n = "html"), n)
		},
		trigger: function(e, t) {
			var n, o = t || s.coming || s.current;
			if(o) {
				if(i.isFunction(o[e]) && (n = o[e].apply(o, Array.prototype.slice.call(arguments, 1))), n === !1 || "afterClose" === e && s.isActive) return !1;
				o.helpers && i.each(o.helpers, function(t, n) {
					var a, r = s.helpers[t];
					n && r && i.isFunction(r[e]) && (a = i.extend(!0, {}, r.defaults, n), r.opts = a, r[e](a, o))
				}), i.event.trigger(e)
			}
		},
		reposition: function(e, t) {
			var i, n = t || s.current,
				o = n && n.wrap;
			s.isOpen && o && (i = s._getPosition(n), e === !1 || e && "scroll" === e.type ? o.stop(!0).animate(i, 200).css("overflow", "visible") : o.css(i))
		},
		update: function(e) {
			var t, n = e && e.type,
				o = (u(), s.current);
			if(o && s.isOpen) {
				if("scroll" === n) {
					if(s.wrap.outerHeight(!0) > s.getViewport().h) return;
					return s.didUpdate && clearTimeout(s.didUpdate), void(s.didUpdate = setTimeout(function() {
						s.reposition(e), s.didUpdate = null
					}, 50))
				}
				s.lock && s.lock.css("overflow", "hidden"), s._setDimension(), s.reposition(e), s.lock && s.lock.css("overflow", "auto"), "float" === o.caption.type && (t = s.getViewport().w - (s.wrap.outerWidth(!0) - s.inner.width()), o.caption.wrap.css("width", t).css("marginLeft", -1 * (.5 * t - .5 * s.inner.width()))), o.expander && (o.canShrink ? i(".fancybox-expand").show().attr("title", o.locales[o.locale].SHRINK) : o.canExpand ? i(".fancybox-expand").show().attr("title", o.locales[o.locale].EXPAND) : i(".fancybox-expand").hide()), s.trigger("onUpdate")
			}
		},
		toggle: function(e) {
			var t = s.current;
			t && s.isOpen && (s.current.fitToView = "boolean" === i.type(e) ? e : !s.current.fitToView, s.update(!0))
		},
		hideLoading: function() {
			i("#fancybox-loading").remove()
		},
		showLoading: function() {
			var e, t;
			s.hideLoading(), e = i('<div id="fancybox-loading"></div>').click(s.cancel).appendTo("body"), s.defaults.fixed || (t = s.getViewport(), e.css({
				position: "absolute",
				top: .5 * t.h + t.y,
				left: .5 * t.w + t.x
			}))
		},
		getViewport: function() {
			var t;
			return t = s.lock ? {
				x: s.lock.scrollLeft(),
				y: s.lock.scrollTop(),
				w: s.lock[0].clientWidth,
				h: s.lock[0].clientHeight
			} : {
				x: o.scrollLeft(),
				y: o.scrollTop(),
				w: l && e.innerWidth ? e.innerWidth : o.width(),
				h: l && e.innerHeight ? e.innerHeight : o.height()
			}
		},
		unbind: function() {
			c(s.wrap) && s.wrap.unbind(".fb"), c(s.inner) && s.inner.unbind(".fb"), a.unbind(".fb"), o.unbind(".fb")
		},
		rebind: function() {
			var e, t = s.current;
			s.unbind(), t && s.isOpen && (o.bind("orientationchange.fb" + (l ? "" : " resize.fb") + (t.autoCenter && !t.locked ? " scroll.fb" : ""), s.update), e = t.keys, e && a.bind("keydown.fb", function(o) {
				var a = o.which || o.keyCode,
					r = o.target || o.srcElement;
				return 27 === a && s.coming ? !1 : void(o.ctrlKey || o.altKey || o.shiftKey || o.metaKey || r && (r.type || i(r).is("[contenteditable]")) || i.each(e, function(e, r) {
					return r[a] !== n ? (o.preventDefault(), t.group.length > 1 && s[e](r[a]), !1) : i.inArray(a, r) > -1 ? (o.preventDefault(), "play" === e ? s.slideshow.toggle() : s[e](), !1) : void 0
				}))
			}), s.lastScroll = u(), t.mouseWheel && s.group.length > 1 && s.wrap.bind("DOMMouseScroll.fb mousewheel.fb MozMousePixelScroll.fb", function(e) {
				var t = e.originalEvent,
					i = t.target || 0,
					n = t.wheelDelta || t.detail || 0,
					o = t.wheelDeltaX || 0,
					a = t.wheelDeltaY || 0,
					r = u();
				if((!i || !i.style || i.style.overflow && "hidden" === i.style.overflow || !(i.clientWidth && i.scrollWidth > i.clientWidth || i.clientHeight && i.scrollHeight > i.clientHeight)) && !(0 === n || s.current && s.current.canShrink)) {
					if(t.stopPropagation(), s.lastScroll && r - s.lastScroll < 80) return void(s.lastScroll = r);
					s.lastScroll = r, t.axis && (t.axis === t.HORIZONTAL_AXIS ? o = -1 * n : t.axis === t.VERTICAL_AXIS && (a = -1 * n)), 0 === o ? a > 0 ? s.prev("down") : s.next("up") : o > 0 ? s.prev("right") : s.next("left")
				}
			}), s.touch.init())
		},
		rebuild: function() {
			var e = s.current;
			e.wrap.find(".fancybox-nav, .fancybox-close, .fancybox-expand").remove(), e.arrows && s.group.length > 1 && ((e.loop || e.index > 0) && i(s._translate(e.tpl.prev)).appendTo(s.inner).bind("click.fb", s.prev), (e.loop || e.index < s.group.length - 1) && i(s._translate(e.tpl.next)).appendTo(s.inner).bind("click.fb", s.next)), e.closeBtn && i(s._translate(e.tpl.closeBtn)).appendTo(s.wrap).bind("click.fb", s.close), e.expander && "image" === e.type && (i('<a title="Expand image" class="fancybox-expand" href="javascript:;"></a>').appendTo(s.inner).bind("click.fb", s.toggle), !e.canShrink && !e.canExpand)
		},
		_start: function(e) {
			var t, n;
			return s.opts.loop && (0 > e && (e = s.group.length + e % s.group.length), e %= s.group.length), (t = s.group[e]) ? (t = i.extend(!0, {}, s.opts, t), t.group = s.group, t.index = e, s.coming = t, !1 === s.trigger("beforeLoad") ? void(s.coming = null) : (s.isActive = !0, s._build(), a.bind("keydown.loading", function(e) {
				27 === (e.which || e.keyCode) && (a.unbind(".loading"), e.preventDefault(), s.cancel())
			}), t.overlay && t.overlay.showEarly && s.overlay.open(t.overlay), n = t.type, void("image" === n ? s._loadImage() : "ajax" === n ? s._loadAjax() : "iframe" === n ? s._loadIframe() : "inline" === n ? s._loadInline() : "html" === n || "swf" === n ? s._afterLoad() : s._error()))) : !1
		},
		_build: function() {
			var e, t, n, l, c = s.coming,
				d = c.caption.type;
			c.wrap = e = i('<div class="fancybox-wrap"></div>').appendTo(c.parent || "body").addClass("fancybox-" + c.theme), c.inner = t = i('<div class="fancybox-inner"></div>').appendTo(e), c["outside" === d || "float" === d ? "inner" : "wrap"].addClass("fancybox-skin fancybox-" + c.theme + "-skin"), c.locked && c.overlay && s.defaults.fixed && (s.lock || (s.lock = i('<div id="fancybox-lock"></div>').appendTo(e.parent())), s.lock.unbind().append(e), c.overlay.closeClick && s.lock.click(function(e) {
				i(e.target).is(s.lock) && s.close()
			}), (a.height() > o.height() || "scroll" === r.css("overflow-y")) && (i("*:visible").filter(function() {
				return "fixed" === i(this).css("position") && !i(this).hasClass("fancybox-overlay") && "fancybox-lock" !== i(this).attr("id")
			}).addClass("fancybox-margin"), r.addClass("fancybox-margin")), n = o.scrollTop(), l = o.scrollLeft(), r.addClass("fancybox-lock"), o.scrollTop(n).scrollLeft(l)), s.trigger("onReady")
		},
		_error: function(e) {
			s.coming && (i.extend(s.coming, {
				type: "html",
				autoWidth: !0,
				autoHeight: !0,
				closeBtn: !0,
				minWidth: 0,
				minHeight: 0,
				padding: [15, 15, 15, 15],
				scrolling: "visible",
				hasError: e,
				content: s._translate(s.coming.tpl.error)
			}), s._afterLoad())
		},
		_loadImage: function() {
			var e = s.imgPreload = new Image;
			e.onload = function() {
				this.onload = this.onerror = null, i.extend(s.coming, {
					width: this.width,
					height: this.height,
					content: i(this).addClass("fancybox-image")
				}), s._afterLoad()
			}, e.onerror = function() {
				this.onload = this.onerror = null, s._error("image")
			}, e.src = s.coming.href, (e.complete !== !0 || e.width < 1) && s.showLoading()
		},
		_loadAjax: function() {
			var e, t, n = s.coming,
				o = n.href;
			e = o.split(/\s+/, 2), o = e.shift(), t = e.shift(), s.showLoading(), s.ajaxLoad = i.ajax(i.extend({}, n.ajax, {
				url: n.href,
				error: function(e, t) {
					s.coming && "abort" !== t ? s._error("ajax", e) : s.hideLoading()
				},
				success: function(e, o) {
					"success" === o && (t && (e = i("<div>").html(e).find(t)), n.content = e, s._afterLoad())
				}
			}))
		},
		_loadIframe: function() {
			var e, t = s.coming;
			t.content = e = i(t.tpl.iframe.replace(/\{rnd\}/g, (new Date).getTime())).attr("scrolling", l ? "auto" : t.iframe.scrolling), t.iframe.preload && (s.showLoading(), s._setDimension(t), t.wrap.addClass("fancybox-tmp"), e.one("load.fb", function() {
				t.iframe.preload && (i(this).data("ready", 1), i(this).bind("load.fb", s.update), s._afterLoad())
			})), e.attr("src", t.href).appendTo(t.inner), t.iframe.preload ? 1 !== e.data("ready") && s.showLoading() : s._afterLoad()
		},
		_loadInline: function() {
			var e = s.coming,
				t = e.href;
			e.content = i(d(t) ? t.replace(/.*(?=#[^\s]+$)/, "") : t), e.content.length ? s._afterLoad() : s._error()
		},
		_preloadImages: function() {
			var e, t, i = s.group,
				n = s.current,
				o = i.length,
				a = n.preload ? Math.min(n.preload, o - 1) : 0;
			for(t = 1; a >= t; t += 1) e = i[(n.index + t) % o], e && "image" === e.type && e.href && ((new Image).src = e.href)
		},
		_afterLoad: function() {
			var e = s.coming,
				t = s.current;
			return a.unbind(".loading"), e && s.isActive !== !1 && !1 !== s.trigger("afterLoad", e, t) ? (i.extend(s, {
				wrap: e.wrap.addClass("fancybox-type-" + e.type + " fancybox-" + (l ? "mobile" : "desktop") + " fancybox-" + e.theme + "-" + (l ? "mobile" : "desktop") + " " + e.wrapCSS),
				inner: e.inner,
				current: e,
				previous: t
			}), s._prepare(), s.trigger("beforeShow", e, t), s.isOpen = !1, s.coming = null, s._setDimension(), s.hideLoading(), e.overlay && !s.overlay.el && s.overlay.open(e.overlay), void s.transitions.open()) : (s.hideLoading(), e && e.wrap && g(e.wrap), t || s._afterZoomOut(e), void(s.coming = null))
		},
		_prepare: function() {
			var e, t = s.current,
				n = t.content || "",
				o = t.wrap,
				a = t.inner,
				r = t.margin,
				l = t.padding,
				p = t.href,
				h = t.type,
				u = (t.scrolling, t.caption),
				g = t.title,
				m = u.type,
				y = "fancybox-placeholder",
				v = "fancybox-display";
			"iframe" !== h && c(n) && n.length && (n.data(y) || n.data(v, n.css("display")).data(y, i('<div class="' + y + '"></div>').insertAfter(n).hide()), n = n.show().detach(), t.wrap.bind("onReset", function() {
				i(this).find(n).length && n.css("display", n.data(v)).replaceAll(n.data(y)).data(y, !1).data(v, !1)
			})), "swf" === h && (n = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + p + '"></param>', e = "", i.each(t.swf, function(t, i) {
				n += '<param name="' + t + '" value="' + i + '"></param>', e += " " + t + '="' + i + '"'
			}), n += '<embed src="' + p + '" type="application/x-shockwave-flash" width="100%" height="100%"' + e + "></embed></object>"), c(n) && n.parent().is(t.inner) || (t.inner.append(n), t.content = t.inner.children(":last")), i.each(["Top", "Right", "Bottom", "Left"], function(e, t) {
				r[e] && o.css("margin" + t, f(r[e])), l[e] && (("Bottom" !== t || "outside" !== m) && o.css("padding" + t, f(l[e])), ("outside" === m || "float" === m) && (a.css("border" + t + "Width", f(l[e])), ("Top" === t || "Left" === t) && a.css("margin" + t, f(-1 * l[e]))))
			}), i.isFunction(g) && (g = g.call(t.element, t)), d(g) && "" !== i.trim(g) && (t.caption.wrap = i('<div class="fancybox-title fancybox-title-' + m + '-wrap">' + g + "</div>").appendTo(t["over" === m ? "inner" : "wrap"]), "float" === m && t.caption.wrap.width(s.getViewport().w - (s.wrap.outerWidth(!0) - s.inner.width())).wrapInner("<div></div>"))
		},
		_setDimension: function(e) {
			var t, i, n, o, a, r, l, d, u, g, m, y, v, w, x, b = s.getViewport(),
				_ = e || s.current,
				k = _.wrap,
				T = _.inner,
				C = _.width,
				O = _.height,
				L = _.minWidth,
				W = _.minHeight,
				E = _.maxWidth,
				S = _.maxHeight,
				H = _.margin,
				M = _.scrollOutside ? _.scrollbarWidth : 0,
				H = _.margin,
				A = _.padding,
				R = _.scrolling,
				P = 1;
			if(R = R.split(","), t = R[0], i = R[1] || t, _.inner.css("overflow-x", "yes" === t ? "scroll" : "no" === t ? "hidden" : t).css("overflow-y", "yes" === i ? "scroll" : "no" === i ? "hidden" : i), o = H[1] + H[3] + A[1] + A[3], n = H[0] + H[2] + A[0] + A[2], L = h(p(L) ? h(L, "w") - o : L), E = h(p(E) ? h(E, "w") - o : E), W = h(p(W) ? h(W, "h") - n : W), S = h(p(S) ? h(S, "h") - n : S), a = h(p(C) ? h(C, "w") - o : C), r = h(p(O) ? h(O, "h") - n : O), _.fitToView && (E = Math.min(E, h("100%", "w") - o), S = Math.min(S, h("100%", "h") - n)), g = b.w, m = b.h, "iframe" === _.type) {
				if(d = _.content, k.removeClass("fancybox-tmp"), (_.autoWidth || _.autoHeight) && d && 1 === d.data("ready")) try {
					d[0].contentWindow && d[0].contentWindow.document.location && (u = d.contents().find("body"), T.addClass("fancybox-tmp"), T.width(screen.width - o).height(99999), M && u.css("overflow-x", "hidden"), _.autoWidth && (a = u.outerWidth(!0)), _.autoHeight && (r = u.outerHeight(!0)), T.removeClass("fancybox-tmp"))
				} catch(j) {}
			} else(_.autoWidth || _.autoHeight) && "image" !== _.type && "swf" !== _.type && (T.addClass("fancybox-tmp"), T.width(_.autoWidth ? "auto" : E), T.height(_.autoHeight ? "auto" : S), _.autoWidth && (a = T[0].scrollWidth || T.width()), _.autoHeight && (r = T[0].scrollHeight || T.height()), T.removeClass("fancybox-tmp"));
			if(C = a, O = r, l = a / r, !_.autoResize) return k.css({
				width: f(C),
				height: "auto"
			}), void T.css({
				width: f(C),
				height: f(O)
			});
			if(_.aspectRatio ? (C > E && (C = E, O = C / l), O > S && (O = S, C = O * l), L > C && (C = L, O = C / l), W > O && (O = W, C = O * l)) : (C = Math.max(L, Math.min(C, E)), _.autoHeight && "iframe" !== _.type && (T.width(C), r = O = T[0].scrollHeight), O = Math.max(W, Math.min(O, S))), k.css({
					width: f(C),
					height: "auto"
				}), T.css({
					width: f(C),
					height: f(O)
				}), y = h(k.outerWidth(!0)), v = h(k.outerHeight(!0)), _.fitToView)
				if(_.aspectRatio)
					for(;
						(y > g || v > m) && C > L && O > W && !(P++ > 30);) O = Math.max(W, Math.min(S, O - 10)), C = h(O * l), L > C && (C = L, O = h(C / l)), C > E && (C = E, O = h(C / l)), k.css({
						width: f(C)
					}), T.css({
						width: f(C),
						height: f(O)
					}), y = h(k.outerWidth(!0)), v = h(k.outerHeight(!0));
				else C = Math.max(L, Math.min(C, C - (y - g))), O = Math.max(W, Math.min(O, O - (v - m)));
			M && "auto" === t && (O < T[0].scrollHeight || c(_.content) && _.content[0] && O < _.content[0].offsetHeight) && E > C + o + M && (C += M), k.css({
				width: C
			}), T.css({
				width: f(C),
				height: f(O)
			}), y = h(k.outerWidth(!0)), v = h(k.outerHeight(!0)), w = (y > g || v > m) && C > L && O > W, x = (g > y || m > v) && (_.aspectRatio ? E > C && S > O && a > C && r > O : (E > C || S > O) && (a > C || r > O)), _.canShrink = w, _.canExpand = x, !d && _.autoHeight && O > W && S > O && !x && T.height("auto")
		},
		_getPosition: function(e) {
			var t = e || s.current,
				i = t.wrap,
				n = s.getViewport(),
				o = {},
				a = n.y,
				r = n.x;
			return o = {
				top: f(Math.max(a, a + (n.h - i.outerHeight(!0)) * t.topRatio)),
				left: f(Math.max(r, r + (n.w - i.outerWidth(!0)) * t.leftRatio)),
				width: f(i.width()),
				height: f(i.height())
			}
		},
		_afterZoomIn: function() {
			var e = s.current;
			e && (s.lock && s.lock.css("overflow", "auto"), s.isOpen = s.isOpened = !0, s.rebuild(), s.rebind(), e.caption && e.caption.wrap && e.caption.wrap.show().css({
				visibility: "visible",
				opacity: 0,
				left: 0
			}).animate({
				opacity: 1
			}, "fast"), s.update(), s.wrap.css("overflow", "visible").addClass("fancybox-open").focus(), s[s.wrap.hasClass("fancybox-skin") ? "wrap" : "inner"].addClass("fancybox-" + e.theme + "-skin-open"), e.caption && e.caption.wrap && e.caption.wrap.show().css("left", 0).animate({
				opacity: 1
			}, "fast"), e.margin[2] > 0 && i('<div class="fancybox-spacer"></div>').css("height", f(e.margin[2] - 2)).appendTo(s.wrap), s.trigger("afterShow"), s._preloadImages(), e.autoPlay && !s.slideshow.isActive && s.slideshow.start())
		},
		_afterZoomOut: function(e) {
			var t = function() {
				g(".fancybox-wrap")
			};
			s.hideLoading(), e = e || s.current, e && e.wrap && e.wrap.hide(), i.extend(s, {
				group: [],
				opts: {},
				coming: null,
				current: null,
				isActive: !1,
				isOpened: !1,
				isOpen: !1,
				isClosing: !1,
				wrap: null,
				skin: null,
				inner: null
			}), s.trigger("afterClose", e), s.coming || s.current || (e.overlay ? s.overlay.close(e.overlay, t) : t())
		},
		_translate: function(e) {
			var t = s.coming || s.current,
				i = t.locales[t.locale];
			return e.replace(/\{\{(\w+)\}\}/g, function(e, t) {
				var o = i[t];
				return o === n ? e : o
			})
		}
	}), s.transitions = {
		_getOrig: function(e) {
			var t = e || s.current,
				i = t.wrap,
				n = t.element,
				a = t.orig,
				r = s.getViewport(),
				l = {},
				d = 50,
				p = 50;
			return !a && n && n.is(":visible") && (a = n.find("img:first:visible"), a.length || (a = n)), !a && t.group[0].element && (a = t.group[0].element.find("img:visible:first")), c(a) && a.is(":visible") ? (l = a.offset(), a.is("img") && (d = a.outerWidth(), p = a.outerHeight()), s.lock && (l.top -= o.scrollTop(), l.left -= o.scrollLeft())) : (l.top = r.y + (r.h - p) * t.topRatio, l.left = r.x + (r.w - d) * t.leftRatio), l = {
				top: f(l.top - .5 * (i.outerHeight(!0) - i.height())),
				left: f(l.left - .5 * (i.outerWidth(!0) - i.width())),
				width: f(d),
				height: f(p)
			}
		},
		_getCenter: function(e) {
			var t = e || s.current,
				i = t.wrap,
				n = s.getViewport(),
				o = {},
				a = n.y,
				r = n.x;
			return o = {
				top: f(Math.max(a, a + (n.h - i.outerHeight(!0)) * t.topRatio)),
				left: f(Math.max(r, r + (n.w - i.outerWidth(!0)) * t.leftRatio)),
				width: f(i.width()),
				height: f(i.height())
			}
		},
		_prepare: function(e, t) {
			var i = e || s.current,
				n = i.wrap,
				o = i.inner;
			n.height(n.height()), o.css({
				width: 100 * o.width() / n.width() + "%",
				height: Math.floor(100 * o.height() / n.height() * 100) / 100 + "%"
			}), t === !0 && n.find(".fancybox-title, .fancybox-spacer, .fancybox-close, .fancybox-nav").remove(), o.css("overflow", "hidden")
		},
		fade: function(e, t) {
			var n = this._getCenter(e),
				o = {
					opacity: 0
				};
			return "open" === t || "changeIn" === t ? [i.extend(n, o), {
				opacity: 1
			}] : [{}, o]
		},
		drop: function(e, t) {
			var n = i.extend(this._getCenter(e), {
					opacity: 1
				}),
				o = i.extend({}, n, {
					opacity: 0,
					top: f(Math.max(s.getViewport().y - e.margin[0], h(n.top) - 200))
				});
			return "open" === t || "changeIn" === t ? [o, n] : [{}, o]
		},
		elastic: function(e, t) {
			var n, o, a, r = e.wrap,
				l = e.margin,
				c = s.getViewport(),
				d = s.direction,
				p = this._getCenter(e),
				f = i.extend({}, p),
				u = i.extend({}, p);
			return "open" === t ? f = this._getOrig(e) : "close" === t ? (f = {}, u = this._getOrig(e)) : d && (n = "up" === d || "down" === d ? "top" : "left", o = "up" === d || "left" === d ? 200 : -200, "changeIn" === t ? (a = h(f[n]) + o, a = "left" === d ? Math.min(a, c.x + c.w - l[3] - r.outerWidth() - 1) : "right" === d ? Math.max(a, c.x - l[1]) : "up" === d ? Math.min(a, c.y + c.h - l[0] - r.outerHeight() - 1) : Math.max(a, c.y - l[2]), f[n] = a) : (a = h(r.css(n)) - o, f = {}, a = "left" === d ? Math.max(a, c.x - l[3]) : "right" === d ? Math.min(a, c.x + c.w - l[1] - r.outerWidth() - 1) : "up" === d ? Math.max(a, c.y - l[0]) : Math.min(a, c.y + c.h - l[2] - r.outerHeight() - 1), u[n] = a)), "open" === t || "changeIn" === t ? (f.opacity = 0, u.opacity = 1) : u.opacity = 0, [f, u]
		},
		open: function() {
			{
				var e, t, n, o, a, r = s.current,
					l = s.previous;
				s.direction
			}
			l && l.wrap.stop(!0).removeClass("fancybox-opened"), s.isOpened ? (e = r.nextEffect, n = r.nextSpeed, o = r.nextEasing, a = "changeIn") : (e = r.openEffect, n = r.openSpeed, o = r.openEasing, a = "open"), "none" === e ? s._afterZoomIn() : (t = this[e](r, a), "elastic" === e && this._prepare(r), r.wrap.css(t[0]), r.wrap.animate(t[1], n, o, s._afterZoomIn)), l && (s.isOpened && "none" !== l.prevEffect ? (l.wrap.stop(!0).removeClass("fancybox-opened"), t = this[l.prevEffect](l, "changeOut"), this._prepare(l, !0), l.wrap.animate(t[1], l.prevSpeed, l.prevEasing, function() {
				g(l.wrap)
			})) : g(i(".fancybox-wrap").not(r.wrap)))
		},
		close: function() {
			var e, t = s.current,
				i = t.wrap.stop(!0).removeClass("fancybox-opened"),
				n = t.closeEffect;
			return "none" === n ? s._afterZoomOut() : (this._prepare(t, !0), e = this[n](t, "close"), void i.addClass("fancybox-animating").animate(e[1], t.closeSpeed, t.closeEasing, s._afterZoomOut))
		}
	}, s.slideshow = {
		_clear: function() {
			this._timer && clearTimeout(this._timer)
		},
		_set: function() {
			this._clear(), s.current && this.isActive && (this._timer = setTimeout(s.next, this._speed))
		},
		_timer: null,
		_speed: null,
		isActive: !1,
		start: function(e) {
			var t = s.current;
			t && (t.loop || t.index < t.group.length - 1) && (this.stop(), this.isActive = !0, this._speed = e || t.playSpeed, a.bind({
				"beforeLoad.player": i.proxy(this._clear, this),
				"onUpdate.player": i.proxy(this._set, this),
				"onCancel.player beforeClose.player": i.proxy(this.stop, this)
			}), this._set(), s.trigger("onPlayStart"))
		},
		stop: function() {
			this._clear(), a.unbind(".player"), this.isActive = !1, this._timer = this._speed = null, s.trigger("onPlayEnd")
		},
		toggle: function() {
			this.isActive ? this.stop() : this.start.apply(this, arguments)
		}
	}, s.overlay = {
		el: null,
		theme: "",
		open: function(e) {
			var t, n, a = this,
				r = this.el,
				l = s.defaults.fixed;
			e = i.extend({}, s.defaults.overlay, e), r ? r.stop(!0).removeAttr("style").unbind(".overlay") : r = i('<div class="fancybox-overlay' + (l ? " fancybox-overlay-fixed" : "") + '"></div>').appendTo(e.parent || "body"), e.closeClick && r.bind("click.overlay", function() {
				return s.lastTouch && u() - s.lastTouch < 300 ? !1 : (s.isActive ? s.close() : a.close(), !1)
			}), n = e.theme || (s.coming ? s.coming.theme : "default"), n !== this.theme && r.removeClass("fancybox-" + this.theme + "-overlay"), this.theme = n, r.addClass("fancybox-" + n + "-overlay").css(e.css), t = r.css("opacity"), !this.el && 1 > t && e.speedIn && r.css({
				opacity: 0,
				filter: "alpha(opacity=0)"
			}).fadeTo(e.speedIn, t), this.el = r, l || (o.bind("resize.overlay", i.proxy(this.update, this)), this.update())
		},
		close: function(e, t) {
			e = i.extend({}, s.defaults.overlay, e), this.el && this.el.stop(!0).fadeOut(e.speedOut, function() {
				o.unbind("resize.overlay"), i(".fancybox-overlay").remove(), s.overlay.el = null, i.isFunction(t) && t()
			})
		},
		update: function() {
			this.el.css({
				width: "100%",
				height: "100%"
			}), this.el.width(a.width()).height(a.height())
		}
	}, s.touch = {
		startX: 0,
		wrapX: 0,
		dx: 0,
		isMoving: !1,
		_start: function(e) {
			var t = (s.current, e.originalEvent.touches ? e.originalEvent.touches[0] : e),
				n = u();
			if(s.isOpen && !s.wrap.is(":animated") && (i(e.target).is(s.inner) || i(e.target).parent().is(s.inner))) {
				if(s.lastTouch && n - s.lastTouch < 300) return e.preventDefault(), s.lastTouch = n, this._cancel(!0), s.toggle(), !1;
				s.lastTouch = n, s.wrap && s.wrap.outerWidth() > s.getViewport().w || (e.preventDefault(), t && s.wrap && s.wrap.outerWidth() < s.getViewport().w && (this.startX = t.pageX, this.wrapX = s.wrap.position().left, this.isMoving = !0, s.inner.bind("touchmove.fb", i.proxy(this._move, this)).one("touchend.fb touchcancel.fb", i.proxy(this._cancel, this))))
			}
		},
		_move: function(e) {
			var t = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
				i = this.startX - t.pageX;
			this.isMoving && s.isOpen && (this.dx = i, s.current.wrap.outerWidth(!0) <= o.width() && (Math.abs(i) >= 50 ? (e.preventDefault(), this.last = 0, this._cancel(!0), i > 0 ? s.next("left") : s.prev("right")) : Math.abs(i) > 3 && (e.preventDefault(), this.last = 0, s.wrap.css("left", this.wrapX - i))))
		},
		_clear: function() {
			this.startX = this.wrapX = this.dx = 0, this.isMoving = !1
		},
		_cancel: function() {
			s.inner && s.inner.unbind("touchmove.fb"), s.isOpen && Math.abs(this.dx) > 3 && s.reposition(!1), this._clear()
		},
		init: function() {
			s.inner && s.touch && (this._cancel(!0), s.inner.bind("touchstart.fb", i.proxy(this._start, this)))
		}
	}, i.easing.easeOutQuad || (i.easing.easeOutQuad = function(e, t, i, n, o) {
		return -n * (t /= o) * (t - 2) + i
	}), a.ready(function() {
		var t, a, l, c;
		i.scrollbarWidth === n && (i.scrollbarWidth = function() {
			var e = i('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),
				t = e.children(),
				n = t.innerWidth() - t.height(99).innerWidth();
			return e.remove(), n
		}), i.support.fixedPosition === n && (i.support.fixedPosition = function() {
			var e = i('<div style="position:fixed;top:20px;padding:0;margin:0;border:0;"></div>').appendTo("body"),
				t = "fixed" === e.css("position") && (e[0].offsetTop > 18 && e[0].offsetTop < 22 || 15 === e[0].offsetTop);
			return e.remove(), t
		}()), i.extend(s.defaults, {
			scrollbarWidth: i.scrollbarWidth(),
			fixed: i.support.fixedPosition,
			parent: i("body")
		}), l = o.scrollTop(), c = o.scrollLeft(), t = i(e).width(), r.addClass("fancybox-lock-test"), a = i(e).width(), r.removeClass("fancybox-lock-test"), o.scrollTop(l).scrollLeft(c), s.lockMargin = a - t, i("<style type='text/css'>.fancybox-margin{margin-right:" + s.lockMargin + "px;}</style>").appendTo("head"), i("script[src*='jquery.fancybox.js']").size() > 0 && i("script[src*='jquery.fancybox.js']").attr("src").match(/autorun/) && i("a[href$='.jpg'],a[href$='.png'],a[href$='.gif'],.fancybox").attr("data-fancybox-group", "gallery").fancybox()
	}), i.fn.fancybox = function(e) {
		var t = this,
			n = this.length ? this.selector : !1,
			o = n && n.indexOf("()") < 0 && !(e && e.live === !1),
			r = function(a) {
				var r = o ? i(n) : t,
					l = i(this).blur(),
					c = e.groupAttr || "data-fancybox-group",
					d = l.attr(c),
					p = this.rel;
				!d && p && "nofollow" !== p && (c = "rel", d = p), d && (l = r.filter("[" + c + '="' + d + '"]'), e.index = l.index(this)), l.length && (a.preventDefault(), s.open(l.get(), e))
			};
		return e = e || {}, o ? a.undelegate(n, "click.fb-start").delegate(n + ":not('.fancybox-close,.fancybox-nav,.fancybox-wrap')", "click.fb-start", r) : t.unbind("click.fb-start").bind("click.fb-start", r), this
	}
}(window, document, jQuery);
! function(t) {
	var i = t.fancybox;
	i.helpers.thumbs = {
		defaults: {
			width: 75,
			height: 50,
			position: "bottom",
			source: function() {}
		},
		list: null,
		items: null,
		count: 0,
		_create: function(i) {
			var e, s, h = this.opts;
			e = "", t.each(i.group, function(t) {
				e += '<li><a data-index="' + t + '" href="javascript:jQuery.fancybox.jumpto(' + t + ');"></a></li>'
			}), this.list = s = t("<ul>" + e + "</ul>"), this.items = s.children(), this.count = this.items.length, this.wrap = t('<div id="fancybox-thumbs" class="' + h.position + '"></div>').append(s).wrapInner('<div class="inner" />').wrapInner('<div class="outer" />').appendTo("body"), t('<a class="fancybox-thumb-prev" href="javascript:;"><span></span></a>').click(t.proxy(this.prev, this)).prependTo(this.wrap), t('<a class="fancybox-thumb-next" href="javascript:;"><span></span></a>').click(t.proxy(this.next, this)).appendTo(this.wrap), s.find("a").width(h.width).height(h.height), this.width = this.items.outerWidth(!0), this.height = this.items.outerHeight(!0), s.width(this.width * this.count).height(this.height)
		},
		_loadPage: function() {
			var e, s, h = this,
				a = function(t) {
					h._setThumb(e, t)
				};
			this.list && (e = this.list.find("a").slice(this.start, this.end + 1).not(".ready").first(), e && e.length && (e.addClass("ready"), s = i.group[e.data("index")], href = this._getThumb(s, a), "string" === t.type(href) ? a(href) : href || this._loadPage()))
		},
		_getThumb: function(i, e) {
			var s, h;
			return s = this.opts.source(i, e), !s && i.element && (s = t(i.element).find("img").attr("src")), !s && (h = i.href.match(/(youtube\.com|youtu\.be)\/(watch\?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*)).*/i)) && (s = "http://img.youtube.com/vi/" + h[3] + "/mqdefault.jpg"), !s && (h = i.href.match(/(?:vimeo(?:pro)?.com)\/(?:[^\d]+)?(\d+)(?:.*)/)) ? (t.getJSON("http://www.vimeo.com/api/v2/video/" + h[1] + ".json?callback=?", {
				format: "json"
			}, function(t) {
				e(t[0].thumbnail_small)
			}), !0) : (!s && "image" === i.type && i.href && (s = i.href), s)
		},
		_setThumb: function(i, e) {
			var s = this,
				h = function() {
					s._loadPage()
				};
			this.list && t("<img />").load(function() {
				var e, a, n = this.width,
					o = this.height,
					r = i.width(),
					l = i.height();
				return s.wrap && n && o ? (e = n / r, a = o / l, e >= 1 && a >= 1 && (e > a ? (n /= a, o = l) : (n = r, o /= e)), t(this).css({
					width: Math.floor(n),
					height: Math.floor(o),
					"margin-top": Math.floor(.3 * l - .3 * o),
					"margin-left": Math.floor(.5 * r - .5 * n)
				}).appendTo(i), void h()) : void h()
			}).error(h).attr("src", e)
		},
		_move: function(e) {
			var s, h, a, n = 0,
				o = 400;
			if(this.wrap) {
				if(s = Math.ceil(this.count / this.itemsMin), void 0 === e && (e = Math.floor(i.current.index / this.itemsMin) + 1), t(".fancybox-thumb-prev, .fancybox-thumb-next").hide(), 2 > s) return t.extend(this, {
					pages: s,
					page: 1,
					start: 0,
					end: this.count
				}), this.list.stop(!0).css({
					"margin-left": "auto",
					"margin-right": "auto",
					left: 0
				}), void this._loadPage();
				1 >= e ? e = 1 : t(".fancybox-thumb-prev").show(), e >= s ? e = s : t(".fancybox-thumb-next").show(), h = (e - 1) * this.itemsMin, a = h + this.itemsMax - 1, n = this.width * this.itemsMin * (e - 1) * -1, this.left !== n && (t.extend(this, {
					pages: s,
					page: e,
					start: h,
					end: a,
					left: n
				}), this._loadPage(), this.list.stop(!0).animate({
					"margin-left": n + "px"
				}, o))
			}
		},
		prev: function() {
			this._move(this.page - 1)
		},
		next: function() {
			this._move(this.page + 1)
		},
		afterLoad: function(t, i) {
			var e = "bottom" === t.position ? 2 : 0;
			return i.group.length < 2 ? void(i.helpers.thumbs = !1) : (this.wrap || this._create(i), void(t.margin !== !1 && (i.margin[e] = Math.max(this.height + 40, i.margin[e]))))
		},
		beforeShow: function(t, i) {
			this.items && (this.items.removeClass("fancybox-thumb-active"), this.current = this.list.find("a[data-index='" + i.index + "']").parent().addClass("fancybox-thumb-active"))
		},
		onUpdate: function() {
			this.wrap && (this.wrap.width(i.getViewport().w), this.view = this.list.parent().innerWidth(), this.itemsMin = Math.floor(this.view / this.width), this.itemsMax = Math.ceil(this.view / this.width), this._move())
		},
		beforeClose: function() {
			this.wrap && this.wrap.stop(!0).remove(), t.extend(this, {
				pages: 0,
				page: 0,
				start: 0,
				end: 0,
				count: 0,
				items: null,
				left: null,
				wrap: null,
				list: null
			})
		}
	}
}(jQuery);
/*
Masked Input plugin for jQuery
Copyright (c) 2007-2013 Josh Bush (digitalbush.com)
Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
Version: 1.3.1
*/
(function(e) {
	function t() {
		var e = document.createElement("input"),
			t = "onpaste";
		return e.setAttribute(t, ""), "function" == typeof e[t] ? "paste" : "input"
	}
	var n, a = t() + ".mask",
		r = navigator.userAgent,
		i = /iphone/i.test(r),
		o = /android/i.test(r);
	e.mask = {
		definitions: {
			9: "[0-9]",
			a: "[A-Za-z]",
			"*": "[A-Za-z0-9]"
		},
		dataName: "rawMaskFn",
		placeholder: "_"
	}, e.fn.extend({
		caret: function(e, t) {
			var n;
			if(0 !== this.length && !this.is(":hidden")) return "number" == typeof e ? (t = "number" == typeof t ? t : e, this.each(function() {
				this.setSelectionRange ? this.setSelectionRange(e, t) : this.createTextRange && (n = this.createTextRange(), n.collapse(!0), n.moveEnd("character", t), n.moveStart("character", e), n.select())
			})) : (this[0].setSelectionRange ? (e = this[0].selectionStart, t = this[0].selectionEnd) : document.selection && document.selection.createRange && (n = document.selection.createRange(), e = 0 - n.duplicate().moveStart("character", -1e5), t = e + n.text.length), {
				begin: e,
				end: t
			})
		},
		unmask: function() {
			return this.trigger("unmask")
		},
		mask: function(t, r) {
			var c, l, s, u, f, h;
			return !t && this.length > 0 ? (c = e(this[0]), c.data(e.mask.dataName)()) : (r = e.extend({
				placeholder: e.mask.placeholder,
				completed: null
			}, r), l = e.mask.definitions, s = [], u = h = t.length, f = null, e.each(t.split(""), function(e, t) {
				"?" == t ? (h--, u = e) : l[t] ? (s.push(RegExp(l[t])), null === f && (f = s.length - 1)) : s.push(null)
			}), this.trigger("unmask").each(function() {
				function c(e) {
					for(; h > ++e && !s[e];);
					return e
				}

				function d(e) {
					for(; --e >= 0 && !s[e];);
					return e
				}

				function m(e, t) {
					var n, a;
					if(!(0 > e)) {
						for(n = e, a = c(t); h > n; n++)
							if(s[n]) {
								if(!(h > a && s[n].test(R[a]))) break;
								R[n] = R[a], R[a] = r.placeholder, a = c(a)
							}
						b(), x.caret(Math.max(f, e))
					}
				}

				function p(e) {
					var t, n, a, i;
					for(t = e, n = r.placeholder; h > t; t++)
						if(s[t]) {
							if(a = c(t), i = R[t], R[t] = n, !(h > a && s[a].test(i))) break;
							n = i
						}
				}

				function g(e) {
					var t, n, a, r = e.which;
					8 === r || 46 === r || i && 127 === r ? (t = x.caret(), n = t.begin, a = t.end, 0 === a - n && (n = 46 !== r ? d(n) : a = c(n - 1), a = 46 === r ? c(a) : a), k(n, a), m(n, a - 1), e.preventDefault()) : 27 == r && (x.val(S), x.caret(0, y()), e.preventDefault())
				}

				function v(t) {
					var n, a, i, l = t.which,
						u = x.caret();
					t.ctrlKey || t.altKey || t.metaKey || 32 > l || l && (0 !== u.end - u.begin && (k(u.begin, u.end), m(u.begin, u.end - 1)), n = c(u.begin - 1), h > n && (a = String.fromCharCode(l), s[n].test(a) && (p(n), R[n] = a, b(), i = c(n), o ? setTimeout(e.proxy(e.fn.caret, x, i), 0) : x.caret(i), r.completed && i >= h && r.completed.call(x))), t.preventDefault())
				}

				function k(e, t) {
					var n;
					for(n = e; t > n && h > n; n++) s[n] && (R[n] = r.placeholder)
				}

				function b() {
					x.val(R.join(""))
				}

				function y(e) {
					var t, n, a = x.val(),
						i = -1;
					for(t = 0, pos = 0; h > t; t++)
						if(s[t]) {
							for(R[t] = r.placeholder; pos++ < a.length;)
								if(n = a.charAt(pos - 1), s[t].test(n)) {
									R[t] = n, i = t;
									break
								}
							if(pos > a.length) break
						} else R[t] === a.charAt(pos) && t !== u && (pos++, i = t);
					return e ? b() : u > i + 1 ? (x.val(""), k(0, h)) : (b(), x.val(x.val().substring(0, i + 1))), u ? t : f
				}
				var x = e(this),
					R = e.map(t.split(""), function(e) {
						return "?" != e ? l[e] ? r.placeholder : e : void 0
					}),
					S = x.val();
				x.data(e.mask.dataName, function() {
					return e.map(R, function(e, t) {
						return s[t] && e != r.placeholder ? e : null
					}).join("")
				}), x.attr("readonly") || x.one("unmask", function() {
					x.unbind(".mask").removeData(e.mask.dataName)
				}).bind("focus.mask", function() {
					clearTimeout(n);
					var e;
					S = x.val(), e = y(), n = setTimeout(function() {
						b(), e == t.length ? x.caret(0, e) : x.caret(e)
					}, 10)
				}).bind("blur.mask", function() {
					y(), x.val() != S && x.change()
				}).bind("keydown.mask", g).bind("keypress.mask", v).bind(a, function() {
					setTimeout(function() {
						var e = y(!0);
						x.caret(e), r.completed && e == x.val().length && r.completed.call(x)
					}, 0)
				}), y()
			}))
		}
	})
})(jQuery);
/* ------------------------------------------------------------------------
SeaInside Screen Control
Author: SeaInside (Mopuc) (https://fl.ru/users/MopuC/)
Version: 1.0
------------------------------------------------------------------------- */
function isVisibleOnPage(elem) {
	var docViewTop = $(window).scrollTop();
	var docViewBottom = docViewTop + $(window).height();
	var elemTop = $(elem).offset().top;
	var elemBottom = elemTop + $(elem).height();
	return((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}
$.fn.seainside_screen_control = function(offset2) {
	if(!offset2) offset2 = 0;
	return this.each(function() {
		var $si_this = $(this);
		$(this).data("offset-top", $(this).offset().top);
		$(this).data("animation-finish", 0);
		$(window).bind("scroll load", function() {
			if(($(window).scrollTop() + $(window).height() - offset2 > $si_this.data("offset-top")) && $si_this.data("animation-finish") == 0) {
				$si_this.trigger("start-animation");
				$si_this.data("animation-finish", 1)
			}
		})
	})
};
/* ------------------------------------------------------------------------
SeaInside Jump Links
Author: SeaInside (Mopuc) (https://fl.ru/users/MopuC/)
Version: 1.0
Date: 08/12/14
------------------------------------------------------------------------- */
$.fn.si_jump = function(e, t, n) {
	e = e || 0;
	t = t || 700;
	n = n || "swing";
	$(this).click(function() {
		elementClick = $(this).prop("href");
		e_pos = elementClick.indexOf("#");
		elementClick = elementClick.substr(e_pos);
		destination = $(elementClick).offset().top;
		$("html, body").animate({
			scrollTop: destination - e
		}, t, n);
		return false
	})
};
/* ------------------------------------------------------------------------
SeaInside Modals
Author: SeaInside (Mopuc) (https://fl.ru/users/MopuC/)
Version: 1.0
Date: 08/12/14
------------------------------------------------------------------------- */
var SIModal = {
	settings: {
		escClose: !0,
		overlayClose: !0,
		fadeSpeed: 700,
		switchSpeed: 450
	},
	activeModals: 0,
	init: function() {
		$(window).bind("load resize SIModal.modalshow", function() {
			$(".si-overlay, .si-overlay-2").css({
				width: $(document).width(),
				height: $(document).height()
			})
		}), this.settings.overlayClose && $(".si-modals-wrapper, .si-modals-wrapper-2").click(function(e) {
			return e.target == this ? (SIModal.closeModals(), !1) : void 0
		}), this.settings.escClose && $(document).keyup(function(e) {
			27 == e.keyCode && SIModal.closeModals()
		})
	},
	attachModal: function(e, t, a, s, i) {
		$(e).click(function() {
			if(void 0 != i && 0 != i && (i.call($(this)), $(this).data("replace-modal") && (t = $(this).data("replace-modal"))), void 0 != s && 0 != s && s.call($(this)), 0 == SIModal.activeModals) {
				if($("html").addClass("si-lock"), $(".si-overlay, .si-modals-wrapper, .si-modals-wrapper " + t).fadeIn(SIModal.settings.fadeSpeed), $(window).trigger("modalshow"), "undefined" != a && 0 != a)
					for(var e in a) $(t + " " + e).val($(this).data(a[e]))
			} else {
				var o = $(t).clone();
				if($(".si-modals-wrapper-2").append(o), "undefined" != a && 0 != a)
					for(var e in a) o.find(e).val($(this).data(a[e]));
				$.fn.SIInit(), $(".si-overlay-2, .si-modals-wrapper-2, .si-modals-wrapper-2 " + t).fadeIn(SIModal.settings.fadeSpeed)
			}
			return SIModal.activeModals++, !1
		})
	},
	switchModal: function(e, t, a, s, i) {
		$(e).click(function() {
			void 0 != i && 0 != i && (i.call($(this)), $(this).data("replace-modal") && (a = $(this).data("replace-modal"))), void 0 != s && 0 != s && s.call($(this));
			var e = $(this).parents(".si-modal"),
				o = $(a);
			"left" == t ? (e.animate({
				left: -400,
				opacity: 0
			}, SIModal.settings.switchSpeed), setTimeout(function() {
				e.hide().css({
					opacity: 1,
					left: "auto",
					right: "auto"
				})
			}, SIModal.settings.switchSpeed), o.css({
				opacity: 0,
				left: 400
			}).delay(SIModal.settings.switchSpeed).show().animate({
				left: 0,
				opacity: 1
			}, SIModal.settings.switchSpeed)) : (e.animate({
				right: -400,
				opacity: 0
			}, SIModal.settings.switchSpeed), setTimeout(function() {
				e.hide().css({
					opacity: 1,
					left: "auto",
					right: "auto"
				})
			}, SIModal.settings.switchSpeed), o.css({
				opacity: 0,
				right: 400
			}).delay(SIModal.settings.switchSpeed).show().animate({
				right: 0,
				opacity: 1
			}, SIModal.settings.switchSpeed))
		})
	},
	attachClose: function(e) {
		$(document).on("click", e, function() {
			return SIModal.closeModals(), !1
		})
	},
	closeModals: function() {
		return this.activeModals > 1 ? ($(".si-overlay-2, .si-modals-wrapper-2, .si-modals-wrapper-2 .si-modal").fadeOut(this.settings.fadeSpeed), setTimeout(function() {
			$(".si-modals-wrapper-2").empty()
		}, this.settings.fadeSpeed)) : ($(".si-overlay, .si-modals-wrapper, .si-modals-wrapper .si-modal, .si-modals-wrapper .si-success-modal").fadeOut(this.settings.fadeSpeed), setTimeout(function() {
			$("html").removeClass("si-lock"), $(".si-modal").css({
				opacity: 1,
				left: "auto",
				right: "auto"
			})
		}, this.settings.fadeSpeed), $(window).trigger("SIModal.modalClose")), this.activeModals--, !1
	}
};
/* ------------------------------------------------------------------------
SeaInside Input Messages
Author: SeaInside (Mopuc) (https://fl.ru/users/MopuC/)
Version: 1.0
------------------------------------------------------------------------- */
$(document).on('click focus', '.si-error', function() {
	$(this).removeClass('si-error');
	$(this).prop('placeholder', $(this).data('old-placeholder'));
});
$.fn.si_show_message = function(text) {
	return this.each(function() {
		var old_placeholder = $(this).prop('placeholder');
		$(this).addClass('si-error');
		$(this).data('old-placeholder', old_placeholder);
		$(this).prop('placeholder', text);
	})
};
/*
 * jQuery Cre-animate - Scrolling Animations - v1.1
 */
(function(e) {
	var t = {
		fadein: "fade-in",
		fadeout: "fade-out",
		slidedownfromtop: "slide-down-from-top",
		slideinfromright: "slide-in-from-right",
		slideupfrombottom: "slide-up-from-bottom",
		slideinfromleft: "slide-in-from-left",
		scaleup: "scale-up",
		scaledown: "scale-down",
		rotate: "rotate",
		flipyaxis: "flip-y-axis",
		flipxaxis: "flip-x-axis"
	};
	var n = {
		ease: "ease",
		"in": "ease-in",
		out: "ease-out",
		"in-out": "ease-in-out",
		snap: "cubic-bezier(0,1,.5,1)",
		easeOutCubic: "cubic-bezier(.215,.61,.355,1)",
		easeInOutCubic: "cubic-bezier(.645,.045,.355,1)",
		easeInCirc: "cubic-bezier(.6,.04,.98,.335)",
		easeOutCirc: "cubic-bezier(.075,.82,.165,1)",
		easeInOutCirc: "cubic-bezier(.785,.135,.15,.86)",
		easeInExpo: "cubic-bezier(.95,.05,.795,.035)",
		easeOutExpo: "cubic-bezier(.19,1,.22,1)",
		easeInOutExpo: "cubic-bezier(1,0,0,1)",
		easeInQuad: "cubic-bezier(.55,.085,.68,.53)",
		easeOutQuad: "cubic-bezier(.25,.46,.45,.94)",
		easeInOutQuad: "cubic-bezier(.455,.03,.515,.955)",
		easeInQuart: "cubic-bezier(.895,.03,.685,.22)",
		easeOutQuart: "cubic-bezier(.165,.84,.44,1)",
		easeInOutQuart: "cubic-bezier(.77,0,.175,1)",
		easeInQuint: "cubic-bezier(.755,.05,.855,.06)",
		easeOutQuint: "cubic-bezier(.23,1,.32,1)",
		easeInOutQuint: "cubic-bezier(.86,0,.07,1)",
		easeInSine: "cubic-bezier(.47,0,.745,.715)",
		easeOutSine: "cubic-bezier(.39,.575,.565,1)",
		easeInOutSine: "cubic-bezier(.445,.05,.55,.95)",
		easeInBack: "cubic-bezier(.6,-.28,.735,.045)",
		easeOutBack: "cubic-bezier(.175, .885,.32,1.275)",
		easeInOutBack: "cubic-bezier(.68,-.55,.265,1.55)"
	};
	var r = {
		opacity: "0",
		"-ms-opacity": "0",
		"-webkit-opacity": "0",
		"-moz-opacity": "0",
		"-o-opacity": "0"
	};
	var i = {
		opacity: "1",
		"-ms-opacity": "1",
		"-webkit-opacity": "1",
		"-moz-opacity": "1",
		"-o-opacity": "1"
	};
	e(document).ready(function() {
		e("html, body").css("overflow-x", "hidden");
		e(".cre-animate").css({
			position: "relative"
		});
		e(".cre-animate").each(function(n, s) {
			var o = e(this).data("animation");
			if(o == t.fadein) {
				e(this).css(r)
			}
			if(o == t.fadeout) {
				e(this).css(i)
			}
			if(o == t.slideinfromright) {
				e(this).css({
					right: "-400px"
				}).css(r)
			}
			if(o == t.slideinfromleft) {
				e(this).css({
					left: "-400px"
				}).css(r)
			}
			if(o == t.slideupfrombottom) {
				e(this).css({
					bottom: "-200px"
				}).css(r)
			}
			if(o == t.slidedownfromtop) {
				e(this).css({
					top: "-200px"
				}).css(r)
			}
			if(o == t.rotate) {
				e(this).css(r)
			}
			if(o == t.scaleup) {
				var u = 0;
				var a = {
					transform: "scale(" + u + ")",
					"-ms-transform": "scale(" + u + ")",
					"-webkit-transform": "scale(" + u + ")",
					"-moz-transform": "scale(" + u + ")",
					"-o-transform": "scale(" + u + ")"
				};
				e(this).css(a).css(r)
			}
			if(o == t.scaledown) {
				var u = 2;
				var a = {
					transform: "scale(" + u + ")",
					"-ms-transform": "scale(" + u + ")",
					"-webkit-transform": "scale(" + u + ")",
					"-moz-transform": "scale(" + u + ")",
					"-o-transform": "scale(" + u + ")"
				};
				e(this).css(a).css(r)
			}
			if(o == t.flipyaxis) {
				var f = {
					transform: "rotateY(180deg)",
					"-ms-transform": "rotateY(180deg)",
					"-webkit-transform": "rotateY(180deg)",
					"-moz-transform": "rotateY(180deg)",
					"-o-transform": "rotateY(180deg)"
				};
				e(this).css(f).css(r)
			}
			if(o == t.flipxaxis) {
				var l = {
					transform: "rotateX(180deg)",
					"-ms-transform": "rotateX(180deg)",
					"-webkit-transform": "rotateX(180deg)",
					"-moz-transform": "rotateX(180deg)",
					"-o-transform": "rotateX(180deg)"
				};
				e(this).css(l).css(r)
			}
		})
	});
	e(window).on("scroll load", function() {
		e(".cre-animate").each(function(s, o) {
			var u = e(this).data("animation");
			var a = e(this).data("offset");
			var f = parseFloat(a);
			var l = f / 100;
			triggerpoint = e(window).height() * l + e(window).scrollTop();
			element = e(this).offset().top;
			if(u == t.slidedownfromtop) {
				element = element + 200
			}
			if(u == t.slideupfrombottom) {
				element = element - 200
			}
			if(u == t.scaleup) {
				element = element - e(this).height() / 2
			}
			if(u == t.scaledown) {
				element = element + e(this).height() / 2
			}
			var c = e(this).data("easing");
			if(n[c]) {
				c = n[c]
			}
			var h = e(this).data("delay");
			var p = e(this).data("speed");
			var d = {
				"transition-duration": p + "ms",
				"-ms-transition-duration": p + "ms",
				"-webkit-transition-duration": p + "ms",
				"-moz-transition-duration": p + "ms",
				"-o-transition-duration": p + "ms",
				"transition-timing-function": c,
				"-ms-transition-timing-function": c,
				"-webkit-transition-timing-function": c,
				"-moz-transition-timing-function": c,
				"-o-transition-timing-function": c,
				"transition-delay": h + "ms",
				"-ms-transition-delay": h + "ms",
				"-webkit-transition-delay": h + "ms",
				"-moz-transition-delay": h + "ms",
				"-o-transition-delay": h + "ms"
			};
			if(element < triggerpoint) {
				if(u == t.fadein) {
					e(this).css(i).css(d)
				}
				if(u == t.fadeout) {
					e(this).css(r).css(d)
				}
				if(u == t.slidedownfromtop) {
					e(this).css({
						top: "0"
					}).css(i).css(d)
				}
				if(u == t.slideupfrombottom) {
					e(this).css({
						bottom: "0"
					}).css(i).css(d)
				}
				if(u == t.slideinfromright) {
					e(this).css({
						right: "0"
					}).css(i).css(d)
				}
				if(u == t.slideinfromleft) {
					e(this).css({
						left: "0"
					}).css(i).css(d)
				}
				if(u == t.scaleup) {
					var v = 1;
					var m = {
						transform: "scale(" + v + ")",
						"-ms-transform": "scale(" + v + ")",
						"-webkit-transform": "scale(" + v + ")",
						"-moz-transform": "scale(" + v + ")",
						"-o-transform": "scale(" + v + ")"
					};
					e(this).css(m).css(i).css(d)
				}
				if(u == t.scaledown) {
					var v = 1;
					var m = {
						transform: "scale(" + v + ")",
						"-ms-transform": "scale(" + v + ")",
						"-webkit-transform": "scale(" + v + ")",
						"-moz-transform": "scale(" + v + ")",
						"-o-transform": "scale(" + v + ")"
					};
					e(this).css(m).css(i).css(d)
				}
				if(u == t.rotate) {
					var g = 360;
					var y = {
						transform: "rotate(" + g + "deg)",
						"-ms-transform": "rotate(" + g + "deg)",
						"-webkit-transform": "rotate(" + g + "deg)",
						"-moz-transform": "rotate(" + g + "deg)",
						"-o-transform": "rotate(" + g + "deg)"
					};
					e(this).css(y).css(i).css(d)
				}
				if(u == t.flipyaxis) {
					var b = {
						transform: "rotateY(360deg)",
						"-ms-transform": "rotateY(360deg)",
						"-webkit-transform": "rotateY(360deg)",
						"-moz-transform": "rotateY(360deg)",
						"-o-transform": "rotateY(360deg)"
					};
					e(this).css(b).css(i).css(d)
				}
				if(u == t.flipxaxis) {
					var w = {
						transform: "rotateX(360deg)",
						"-ms-transform": "rotateX(360deg)",
						"-webkit-transform": "rotateX(360deg)",
						"-moz-transform": "rotateX(360deg)",
						"-o-transform": "rotateX(360deg)"
					};
					e(this).css(w).css(i).css(d)
				}
			}
		})
	})
})(jQuery)