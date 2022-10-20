/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Wrapper for {@link qx.bom.element.AnimationCss} and
 * {@link qx.bom.element.AnimationJs}. It offers the pubilc API and decides using
 * feature checks either to use CSS animations or JS animations.
 *
 * If you use this class, the restrictions of the JavaScript animations apply.
 * This means that you can not use transforms and custom bezier timing functions.
 */
qx.Bootstrap.define("qx.bom.element.Animation",
{
  statics : {

    /**
     * This function takes care of the feature check and starts the animation.
     * It takes a DOM element to apply the animation to, and a description.
     * The description should be a map, which could look like this:
     *
     * <pre class="javascript">
     * {
     *   "duration": 1000,
     *   "keep": 100,
     *   "keyFrames": {
     *     0 : {"opacity": 1, "scale": 1},
     *     100 : {"opacity": 0, "scale": 0}
     *   },
     *   "origin": "50% 50%",
     *   "repeat": 1,
     *   "timing": "ease-out",
     *   "alternate": false,
     *   "reverse": false
     * }
     * </pre>
     *
     * *duration* is the time in milliseconds one animation cycle should take.
     *
     * *keep* is the key frame to apply at the end of the animation. (optional)
     *   Keep in mind that the keep key is reversed in case you use an reverse
     *   animation or set the alternate key and a even repeat count.
     *
     * *keyFrames* is a map of separate frames. Each frame is defined by a
     *   number which is the percentage value of time in the animation. The value
     *   is a map itself which holds css properties or transforms
     *   {@link qx.bom.element.Transform} (Transforms only for CSS Animations).
     *
     * *origin* maps to the transform origin {@link qx.bom.element.Transform#setOrigin}
     *   (Only for CSS animations).
     *
     * *repeat* is the amount of time the animation should be run in
     *   sequence. You can also use "infinite".
     *
     * *timing* takes one of the predefined value:
     *   <code>ease</code> | <code>linear</code> | <code>ease-in</code>
     *   | <code>ease-out</code> | <code>ease-in-out</code> |
     *   <code>cubic-bezier(&lt;number&gt;, &lt;number&gt;, &lt;number&gt;, &lt;number&gt;)</code>
     *   (cubic-bezier only available for CSS animations)
     *
     * *alternate* defines if every other animation should be run in reverse order.
     *
     * @param el {Element} The element to animate.
     * @param desc {Map} The animations description.
     * @param duration {Integer?} The duration in milliseconds of the animation
     *   which will override the duration given in the description.
     * @return {qx.bom.element.AnimationHandle} AnimationHandle instance to control
     *   the animation.
     */
    animate : function(el, desc, duration) {
      if (qx.core.Environment.get("css.animation")) {
        return qx.bom.element.AnimationCss.animate(el, desc, duration);
      } else {
        return qx.bom.element.AnimationJs.animate(el, desc, duration);
      }
    },


    /**
     * Starts an animation in reversed order. For further details, take a look at
     * the {@link #animate} method.
     * @param el {Element} The element to animate.
     * @param desc {Map} The animations description.
     * @param duration {Integer?} The duration in milliseconds of the animation
     *   which will override the duration given in the description.
     * @return {qx.bom.element.AnimationHandle} AnimationHandle instance to control
     *   the animation.
     */
    animateReverse : function(el, desc, duration) {
      if (qx.core.Environment.get("css.animation")) {
        return qx.bom.element.AnimationCss.animateReverse(el, desc, duration);
      } else {
        return qx.bom.element.AnimationJs.animateReverse(el, desc, duration);
      }
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * Responsible for checking all relevant animation properties.
 *
 * Spec: http://www.w3.org/TR/css3-animations/
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.CssAnimation",
{
  statics : {
    /**
     * Main check method which returns an object if CSS animations are
     * supported. This object contains all necessary keys to work with CSS
     * animations.
     * <ul>
     *  <li><code>name</code> The name of the css animation style</li>
     *  <li><code>play-state</code> The name of the play-state style</li>
     *  <li><code>end-event</code> The name of the end event</li>
     *  <li><code>keyframes</code> The name of the keyframes selector.</li>
     * </ul>
     *
     * @internal
     * @return {Object|null} The described object or null, if animations are
     *   not supported.
     */
    getSupport : function() {
      var name = qx.bom.client.CssAnimation.getName();
      if (name != null) {
        return {
          "name" : name,
          "play-state" : qx.bom.client.CssAnimation.getPlayState(),
          "end-event" : qx.bom.client.CssAnimation.getAnimationEnd(),
          "keyframes" : qx.bom.client.CssAnimation.getKeyFrames()
        };
      }
      return null;
    },


    /**
     * Checks for the 'animation-play-state' CSS style.
     * @internal
     * @return {String|null} The name of the style or null, if the style is
     *   not supported.
     */
    getPlayState : function() {
      return qx.bom.Style.getPropertyName("AnimationPlayState");
    },


    /**
     * Checks for the style name used for animations.
     * @internal
     * @return {String|null} The name of the style or null, if the style is
     *   not supported.
     */
    getName : function() {
      return qx.bom.Style.getPropertyName("animation");
    },


    /**
     * Checks for the event name of animation end.
     * @internal
     * @return {String} The name of the event.
     */
    getAnimationEnd : function() {
      var mapping = {
        "msAnimation" : "MSAnimationEnd",
        "WebkitAnimation" : "webkitAnimationEnd",
        "MozAnimation" : "animationend",
        "OAnimation" : "oAnimationEnd",
        "animation" : "animationend"
      }

      return mapping[this.getName()];
    },


    /**
     * Checks what selector should be used to add keyframes to stylesheets.
     * @internal
     * @return {String|null} The name of the selector or null, if the selector
     *   is not supported.
     */
    getKeyFrames : function() {
      var prefixes = qx.bom.Style.VENDOR_PREFIXES;
      var keyFrames = [];
      for (var i=0; i < prefixes.length; i++) {
        var key = "@" + qx.lang.String.hyphenate(prefixes[i]) + "-keyframes";
        // special treatment for IE10
        if (key == "@ms-keyframes") {
          key = "@-ms-keyframes";
        }
        keyFrames.push(key);
      };
      keyFrames.unshift("@keyframes");

      var sheet = qx.bom.Stylesheet.createElement();
      for (var i=0; i < keyFrames.length; i++) {
        try {
          qx.bom.Stylesheet.addRule(sheet, keyFrames[i] + " name", "");
          return keyFrames[i];
        } catch (e) {}
      };

      return null;
    }
  },


  defer : function(statics) {
    qx.core.Environment.add("css.animation", statics.getSupport);
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class is responsible for applying CSS3 animations to plain DOM elements.
 *
 * The implementation is mostly a cross-browser wrapper for applying the
 * animations, including transforms. If the browser does not support
 * CSS animations, but you have set a keep frame, the keep frame will be applied
 * immediately, thus making the animations optional.
 *
 * The API aligns closely to the spec wherever possible.
 *
 * http://www.w3.org/TR/css3-animations/
 *
 * {@link qx.bom.element.Animation} is the class, which takes care of the
 * feature detection for CSS animations and decides which implementation
 * (CSS or JavaScript) should be used. Most likely, this implementation should
 * be the one to use.
 */
qx.Bootstrap.define("qx.bom.element.AnimationCss",
{
  statics : {
    // initialization
    __sheet : null,
    __rulePrefix : "Anni",
    __id : 0,
    /** Static map of rules */
    __rules : {},

    /** The used keys for transforms. */
    __transitionKeys : {
      "scale": true,
      "rotate" : true,
      "skew" : true,
      "translate" : true
    },

    /** Map of cross browser CSS keys. */
    __cssAnimationKeys : qx.core.Environment.get("css.animation"),


    /**
     * This is the main function to start the animation in reverse mode.
     * For further details, take a look at the documentation of the wrapper
     * {@link qx.bom.element.Animation}.
     * @param el {Element} The element to animate.
     * @param desc {Map} Animation description.
     * @param duration {Integer?} The duration of the animation which will
     *   override the duration given in the description.
     * @return {qx.bom.element.AnimationHandle} The handle.
     */
    animateReverse : function(el, desc, duration) {
      return this._animate(el, desc, duration, true);
    },

    /**
     * This is the main function to start the animation. For further details,
     * take a look at the documentation of the wrapper
     * {@link qx.bom.element.Animation}.
     * @param el {Element} The element to animate.
     * @param desc {Map} Animation description.
     * @param duration {Integer?} The duration of the animation which will
     *   override the duration given in the description.
     * @return {qx.bom.element.AnimationHandle} The handle.
     */
    animate : function(el, desc, duration) {
      return this._animate(el, desc, duration, false);
    },


    /**
     * Internal method to start an animation either reverse or not.
     * {@link qx.bom.element.Animation}.
     * @param el {Element} The element to animate.
     * @param desc {Map} Animation description.
     * @param duration {Integer?} The duration of the animation which will
     *   override the duration given in the description.
     * @param reverse {Boolean} <code>true</code>, if the animation should be
     *   reversed.
     * @return {qx.bom.element.AnimationHandle} The handle.
     */
    _animate : function(el, desc, duration, reverse) {
      this.__normalizeDesc(desc);

      // @deprecated since 2.0
      if (desc.hasOwnProperty("reverse")) {
        reverse = desc.reverse;
        if (qx.core.Environment.get("qx.debug")) {
          qx.log.Logger.warn(
            "The key 'reverse' is deprecated: Please use the method " +
            "'animateReverse' instead."
          );
          qx.log.Logger.trace();
        }
      }

      // debug validation
      if (qx.core.Environment.get("qx.debug")) {
        this.__validateDesc(desc);
      }

      // reverse the keep property if the animation is reverse as well
      var keep = desc.keep;
      if (keep != null && (reverse || (desc.alternate && desc.repeat % 2 == 0))) {
        keep = 100 - keep;
      }

      if (!this.__sheet) {
        this.__sheet = qx.bom.Stylesheet.createElement();
      }
      var keyFrames = desc.keyFrames;

      if (duration == undefined) {
        duration = desc.duration;
      }

      // if animations are supported
      if (this.__cssAnimationKeys != null) {
        var name = this.__addKeyFrames(keyFrames, reverse);

        var style =
          name + " " +
          duration + "ms " +
          desc.repeat + " " +
          desc.timing + " " +
          (desc.alternate ? "alternate" : "");

        var eventName = this.__cssAnimationKeys["end-event"];
        qx.bom.Event.addNativeListener(el, eventName, this.__onAnimationEnd);

        el.style[qx.lang.String.camelCase(this.__cssAnimationKeys["name"])] = style;
        // use the fill mode property if available and suitable
        if (keep && keep == 100 && this.__cssAnimationKeys["fill-mode"]) {
          el.style[this.__cssAnimationKeys["fill-mode"]] = "forwards";
        }
      }

      var animation = new qx.bom.element.AnimationHandle();
      animation.desc = desc;
      animation.el = el;
      animation.keep = keep;
      el.$$animation = animation;

      // additional transform keys
      if (desc.origin != null) {
        qx.bom.element.Transform.setOrigin(el, desc.origin);
      }

      // fallback for browsers not supporting animations
      if (this.__cssAnimationKeys == null) {
        window.setTimeout(function() {
          qx.bom.element.AnimationCss.__onAnimationEnd({target: el});
        }, 0);
      }

      return animation;
    },


    /**
     * Handler for the animation end.
     * @param e {Event} The native event from the browser.
     */
    __onAnimationEnd : function(e) {
      var el = e.target;
      var animation = el.$$animation;

      // ignore events when already cleaned up
      if (!animation) {
        return;
      }

      var desc = animation.desc;

      if (qx.bom.element.AnimationCss.__cssAnimationKeys != null) {
        // reset the styling
        var key = qx.lang.String.camelCase(
          qx.bom.element.AnimationCss.__cssAnimationKeys["name"]
        );
        el.style[key] = "";

        qx.bom.Event.removeNativeListener(
          el,
          qx.bom.element.AnimationCss.__cssAnimationKeys["name"],
          qx.bom.element.AnimationCss.__onAnimationEnd
        );
      }

      if (desc.origin != null) {
        qx.bom.element.Transform.setOrigin(el, "");
      }

      qx.bom.element.AnimationCss.__keepFrame(el, desc.keyFrames[animation.keep]);

      el.$$animation = null;
      animation.el = null;
      animation.ended = true;

      animation.emit("end", el);
    },


    /**
     * Helper method which takes an element and a key frame description and
     * applies the properties defined in the given frame to the element. This
     * method is used to keep the state of the animation.
     * @param el {Element} The element to apply the frame to.
     * @param endFrame {Map} The description of the end frame, which is basically
     *   a map containing CSS properties and values including transforms.
     */
    __keepFrame : function(el, endFrame) {
      // keep the element at this animation step
      var transforms;
      for (var style in endFrame) {
        if (style in qx.bom.element.AnimationCss.__transitionKeys) {
          if (!transforms) {
            transforms = {};
          }
          transforms[style] = endFrame[style];
        } else {
          el.style[qx.lang.String.camelCase(style)] = endFrame[style];
        }
      }

      // transform keeping
      if (transforms) {
        qx.bom.element.Transform.transform(el, transforms);
      }
    },


    /**
     * Preprocessing of the description to make sure every necessary key is
     * set to its default.
     * @param desc {Map} The description of the animation.
     */
    __normalizeDesc : function(desc) {
      if (!desc.hasOwnProperty("alternate")) {
        desc.alternate = false;
      }
      if (!desc.hasOwnProperty("keep")) {
        desc.keep = null;
      }
      if (!desc.hasOwnProperty("repeat")) {
        desc.repeat = 1;
      }
      if (!desc.hasOwnProperty("timing")) {
        desc.timing = "linear";
      }
      if (!desc.hasOwnProperty("origin")) {
        desc.origin = null;
      }
    },


    /**
     * Debugging helper to validate the description.
     * @signature function(desc)
     * @param desc {Map} The description of the animation.
     */
    __validateDesc : qx.core.Environment.select("qx.debug", {
      "true" : function(desc) {
        var possibleKeys = [
          "origin", "duration", "keep", "keyFrames",
          "repeat", "timing", "alternate", "reverse"
          //@deprecated since 2.0 (reverse key)
        ];

        // check for unknown keys
        for (var name in desc) {
          if (!(possibleKeys.indexOf(name) != -1)) {
            qx.Bootstrap.warn("Unknown key '" + name + "' in the animation description.");
          }
        };

        if (desc.keyFrames == null) {
          qx.Bootstrap.warn("No 'keyFrames' given > 0");
        } else {
          // check the key frames
          for (var pos in desc.keyFrames) {
            if (pos < 0 || pos > 100) {
              qx.Bootstrap.warn("Keyframe position needs to be between 0 and 100");
            }
          }
        }
      },

      "default" : null
    }),


    /**
     * Helper to add the given frames to an internal CSS stylesheet. It parses
     * the description and adds the key frames to the sheet.
     * @param frames {Map} A map of key frames that describe the animation.
     * @param reverse {Boolean} <code>true</code>, if the key frames should
     *   be added in reverse order.
     */
    __addKeyFrames : function(frames, reverse) {
      var rule = "";

      // for each key frame
      for (var position in frames) {
        rule += (reverse ? -(position - 100) : position) + "% {";

        var frame = frames[position];
        var transforms;
        // each style
        for (var style in frame) {
          if (style in this.__transitionKeys) {
            if (!transforms) {
              transforms = {};
            }
            transforms[style] = frame[style];
          } else {
            rule += style + ":" + frame[style] + ";";
          }
        }

        // transform handling
        if (transforms) {
          rule += qx.bom.element.Transform.getCss(transforms);
        }

        rule += "} ";
      }

      // cached shorthand
      if (this.__rules[rule]) {
        return this.__rules[rule];
      }

      var name = this.__rulePrefix + this.__id++;
      var selector = this.__cssAnimationKeys["keyframes"] + " " + name;
      qx.bom.Stylesheet.addRule(this.__sheet, selector, rule);

      this.__rules[rule] = name;

      return name;
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Basic implementation for an event emitter. This supplies a basic and
 * minimalistic event mechanism.
 */
qx.Bootstrap.define("qx.event.Emitter",
{
  extend : Object,
  statics : {
    /** Static storage for all event listener */
    __storage : []
  },

  members :
  {
    __listener : null,
    __any : null,


    /**
     * Attach a listener to the event emitter. The given <code>name</code>
     * will define the type of event. Handing in a <code>'*'</code> will
     * listen to all events emitted by the event emitter.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {function} The function execute on {@link #emit}.
     * @param ctx {?var} The context of the listener.
     * @return {Integer} An unique <code>id</code> for the attached listener.
     */
    on : function(name, listener, ctx) {
      this.__getStorage(name).push({listener: listener, ctx: ctx});
      qx.event.Emitter.__storage.push({name: name, listener: listener, ctx: ctx});
      return qx.event.Emitter.__storage.length - 1;
    },


    /**
     * Attach a listener to the event emitter which will be executed only once.
     * The given <code>name</code> will define the type of event. Handing in a
     * <code>'*'</code> will listen to all events emitted by the event emitter.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {function} The function execute on {@link #emit}.
     * @param ctx {?var} The context of the listener.
     * @return {Integer} An unique <code>id</code> for the attached listener.
     */
    once : function(name, listener, ctx) {
      this.__getStorage(name).push({listener: listener, ctx: ctx, once: true});
      qx.event.Emitter.__storage.push({name: name, listener: listener, ctx: ctx});
      return qx.event.Emitter.__storage.length - 1;
    },


    /**
     * Remove a listener from the event emitter. The given <code>name</code>
     * will define the type of event.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {function} The function execute on {@link #emit}.
     * @param ctx {?var} The context of the listener.
     * @return {Integer|null} The listener's id if it was removed or
     * <code>null</code> if it wasn't found
     */
    off : function(name, listener, ctx) {
      var storage = this.__getStorage(name);
      for (var i = storage.length - 1; i >= 0; i--) {
        var entry = storage[i];
        if (entry.listener == listener && entry.ctx == ctx) {
          storage.splice(i, 1);
          return i;
        }
      };
      return null;
    },


    /**
     * Removes the listener identified by the given <code>id</code>. The id
     * will be return on attaching the listener and can be stored for removing.
     *
     * @param id {Integer} The id of the listener.
     */
    offById : function(id) {
      var entry = qx.event.Emitter.__storage[id];
      this.off(entry.name, entry.listener, entry.ctx);
    },




    /**
     * Alternative for {@link #on}.
     * @param name {String} The name of the event to listen to.
     * @param listener {function} The function execute on {@link #emit}.
     * @param ctx {?var} The context of the listener.
     * @return {Integer} An unique <code>id</code> for the attached listener.
     */
    addListener : function(name, listener, ctx) {
      return this.on(name, listener, ctx);
    },


    /**
     * Alternative for {@link #once}.
     * @param name {String} The name of the event to listen to.
     * @param listener {function} The function execute on {@link #emit}.
     * @param ctx {?var} The context of the listener.
     * @return {Integer} An unique <code>id</code> for the attached listener.
     */
    addListenerOnce : function(name, listener, ctx) {
      return this.once(name, listener, ctx);
    },


    /**
     * Alternative for {@link #off}.
     * @param name {String} The name of the event to listen to.
     * @param listener {function} The function execute on {@link #emit}.
     * @param ctx {?var} The context of the listener.
     */
    removeListener : function(name, listener, ctx) {
      this.off(name, listener, ctx);
    },


    /**
     * Alternative for {@link #offById}.
     * @param id {Integer} The id of the listener.
     */
    removeListenerById : function(id) {
     this.offById(id);
    },




    /**
     * Emits an event with the given name. The data will be passed
     * to the listener.
     * @param name {String} The name of the event to emit.
     * @param data {?var} The data which should be passed to the listener.
     */
    emit : function(name, data) {
      var storage = this.__getStorage(name);
      for (var i = storage.length - 1; i >= 0; i--) {
        var entry = storage[i];
        entry.listener.call(entry.ctx, data);
        if (entry.once) {
          storage.splice(i, 1);
        }
      };
      // call on any
      storage = this.__getStorage("*");
      for (var i = storage.length - 1; i >= 0; i--) {
        var entry = storage[i];
        entry.listener.call(entry.ctx, data);
      };
    },



    /**
     * Returns the internal attached listener.
     * @internal
     * @return {Map} A map which has the event name as key. The values are
     *   arrays containing a map with 'listener' and 'ctx'.
     */
    getListeners : function() {
      return this.__listener;
    },


    /**
     * Internal helper which will return the storage for the given name.
     * @param name {String} The name of the event.
     * @return {Array} An array which is the storage for the listener and
     *   the given event name.
     */
    __getStorage : function(name) {
      if (this.__listener == null) {
        this.__listener = {};
      }
      if (this.__listener[name] == null) {
        this.__listener[name] = [];
      }
      return this.__listener[name];
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/* ************************************************************************

#ignore(qx.bom.element.AnimationJs)

************************************************************************ */

/**
 * This is a simple handle, which will be returned when an animation is
 * started using the {@link qx.bom.element.Animation#animate} method. It
 * basically controls the animation.
 */
qx.Bootstrap.define("qx.bom.element.AnimationHandle",
{
  extend : qx.event.Emitter,


  construct : function() {
    var css = qx.core.Environment.get("css.animation");
    this.__playState = css && css["play-state"];
    this.__playing = true;
  },


  events: {
    /**
     * Fired when the animation started via {@link qx.bom.element.Animation} has
     * ended.
     */
    "end" : "Element"
  },


  members :
  {
    __playState : null,
    __playing : false,
    __ended : false,


    /**
     * Accessor of the playing state.
     * @return {Boolean} <code>true</code>, if the animations is playing.
     */
    isPlaying : function() {
      return this.__playing;
    },


    /**
     * Accessor of the ended state.
     * @return {Boolean} <code>true</code>, if the animations has ended.
     */
    isEnded : function() {
      return this.__ended;
    },


    /**
     * Pauses the animation, if running. If not running, it will be ignored.
     */
    pause : function() {
      if (this.el) {
        this.el.style[this.__playState] = "paused";
        this.el.$$animation.__playing = false;
        // in case the animation is based on JS
        if (this.animationId && qx.bom.element.AnimationJs) {
          qx.bom.element.AnimationJs.pause(this);
        }
      }
    },


    /**
     * Resumes an animation. This does not start the animation once it has ended.
     */
    play : function() {
      if (this.el) {
        this.el.style[this.__playState] = "running";
        this.el.$$animation.__playing = true;
        // in case the animation is based on JS
        if (this.i != undefined && qx.bom.element.AnimationJs) {
          qx.bom.element.AnimationJs.play(this);
        }
      }
    },


    /**
     * Stops the animation if running.
     */
    stop : function() {
      if (this.el && qx.core.Environment.get("css.animation")) {
        this.el.style[this.__playState] = "";
        this.el.style[qx.core.Environment.get("css.animation").name] = "";
        this.el.$$animation.__playing = false;
        this.el.$$animation.__ended = true;
      }
      // in case the animation is based on JS
      if (qx.bom.element.AnimationJs) {
        qx.bom.element.AnimationJs.stop(this);
      }
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * Responsible for checking all relevant CSS transform properties.
 *
 * Specs:
 * http://www.w3.org/TR/css3-2d-transforms/
 * http://www.w3.org/TR/css3-3d-transforms/
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.CssTransform",
{
  statics :
  {
    /**
     * Main check method which returns an object if CSS animations are
     * supported. This object contains all necessary keys to work with CSS
     * animations.
     * <ul>
     *  <li><code>name</code> The name of the css transform style</li>
     *  <li><code>style</code> The name of the css transform-style style</li>
     *  <li><code>origin</code> The name of the transform-origin style</li>
     *  <li><code>3d</code> Whether 3d transforms are supported</li>
     *  <li><code>perspective</code> The name of the perspective style</li>
     *  <li><code>perspective-origin</code> The name of the perspective-origin style</li>
     *  <li><code>backface-visibility</code> The name of the backface-visibility style</li>
     * </ul>
     *
     * @internal
     * @return {Object|null} The described object or null, if animations are
     *   not supported.
     */
    getSupport : function() {
      var name = qx.bom.client.CssTransform.getName();
      if (name != null) {
        return {
          "name" : name,
          "style" : qx.bom.client.CssTransform.getStyle(),
          "origin" : qx.bom.client.CssTransform.getOrigin(),
          "3d" : qx.bom.client.CssTransform.get3D(),
          "perspective" : qx.bom.client.CssTransform.getPerspective(),
          "perspective-origin" : qx.bom.client.CssTransform.getPerspectiveOrigin(),
          "backface-visibility" : qx.bom.client.CssTransform.getBackFaceVisibility()
        };
      }
      return null;
    },

    /**
     * Checks for the style name used to set the transform origin.
     * @internal
     * @return {String|null} The name of the style or null, if the style is
     *   not supported.
     */
    getStyle : function() {
      return qx.bom.Style.getPropertyName("TransformStyle");
    },


    /**
     * Checks for the style name used to set the transform origin.
     * @internal
     * @return {String|null} The name of the style or null, if the style is
     *   not supported.
     */
    getPerspective : function() {
      return qx.bom.Style.getPropertyName("Perspective");
    },


    /**
     * Checks for the style name used to set the perspective origin.
     * @internal
     * @return {String|null} The name of the style or null, if the style is
     *   not supported.
     */
    getPerspectiveOrigin : function() {
      return qx.bom.Style.getPropertyName("PerspectiveOrigin");
    },


    /**
     * Checks for the style name used to set the backface visibility.
     * @internal
     * @return {String|null} The name of the style or null, if the style is
     *   not supported.
     */
    getBackFaceVisibility : function() {
      return qx.bom.Style.getPropertyName("BackfaceVisibility");
    },


    /**
     * Checks for the style name used to set the transform origin.
     * @internal
     * @return {String|null} The name of the style or null, if the style is
     *   not supported.
     */
    getOrigin : function() {
      return qx.bom.Style.getPropertyName("TransformOrigin");
    },


    /**
     * Checks for the style name used for transforms.
     * @internal
     * @return {String|null} The name of the style or null, if the style is
     *   not supported.
     */
    getName : function() {
      return qx.bom.Style.getPropertyName("Transform");
    },


    /**
     * Checks if 3D transforms are supported.
     * @internal
     * @return {Boolean} <code>true</code>, if 3D transformations are supported
     */
    get3D : function() {
      var div = document.createElement('div');
      var ret = false;
      var properties = ["perspectiveProperty", "WebkitPerspective", "MozPerspective"];
      for (var i = properties.length - 1; i >= 0; i--){
        ret = ret ? ret : div.style[properties[i]] != undefined;
      };

      return ret;
    }
  },



  defer : function(statics) {
    qx.core.Environment.add("css.transform", statics.getSupport);
    qx.core.Environment.add("css.transform.3d", statics.get3D);
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * This class is responsible for applying CSS3 transforms to plain DOM elements.
 * The implementation is mostly a cross browser wrapper for applying the
 * transforms.
 * The API is keep to the spec as close as possible.
 *
 * http://www.w3.org/TR/css3-3d-transforms/
 */
qx.Bootstrap.define("qx.bom.element.Transform",
{
  statics :
  {
    /** The dimensions of the transforms */
    __dimensions : ["X", "Y", "Z"],

    /** Internal storage of the CSS names */
    __cssKeys : qx.core.Environment.get("css.transform"),


    /**
     * Method to apply multiple transforms at once to the given element. It
     * takes a map containing the transforms you want to apply plus the values
     * e.g.<code>{scale: 2, rotate: "5deg"}</code>.
     * The values can be either singular, which means a single value will
     * be added to the CSS. If you give an array, the values will be split up
     * and each array entry will be used for the X, Y or Z dimension in that
     * order e.g. <code>{scale: [2, 0.5]}</code> will result in a element
     * double the size in X direction and half the size in Y direction.
     * Make sure your browser supports all transformations you apply.
     * @param el {Element} The element to apply the transformation.
     * @param transforms {Map} The map containing the transforms and value.
     */
    transform : function(el, transforms) {
      var transformCss = this.__mapToCss(transforms);
      if (this.__cssKeys != null) {
        var style = this.__cssKeys["name"];
        el.style[style] = transformCss;
      }
    },


    /**
     * Translates the given element by the given value. For further details, take
     * a look at the {@link #transform} method.
     * @param el {Element} The element to apply the transformation.
     * @param value {String|Array} The value to translate e.g. <code>"10px"</code>.
     */
    translate : function(el, value) {
      this.transform(el, {translate: value});
    },


    /**
     * Scales the given element by the given value. For further details, take
     * a look at the {@link #transform} method.
     * @param el {Element} The element to apply the transformation.
     * @param value {Number|Array} The value to scale.
     */
    scale : function(el, value) {
      this.transform(el, {scale: value});
    },


    /**
     * Rotates the given element by the given value. For further details, take
     * a look at the {@link #transform} method.
     * @param el {Element} The element to apply the transformation.
     * @param value {String|Array} The value to rotate e.g. <code>"90deg"</code>.
     */
    rotate : function(el, value) {
      this.transform(el, {rotate: value});
    },


    /**
     * Skews the given element by the given value. For further details, take
     * a look at the {@link #transform} method.
     * @param el {Element} The element to apply the transformation.
     * @param value {String|Array} The value to skew e.g. <code>"90deg"</code>.
     */
    skew : function(el, value) {
      this.transform(el, {skew: value});
    },


    /**
     * Converts the given map to a string which chould ba added to a css
     * stylesheet.
     * @param transforms {Map} The transforms map. For a detailed description,
     * take a look at the {@link #transform} method.
     * @return {String} The CSS value.
     */
    getCss : function(transforms) {
      var transformCss = this.__mapToCss(transforms);
      if (this.__cssKeys != null) {
        var style = this.__cssKeys["name"];
        return qx.lang.String.hyphenate(style) + ":" + transformCss + ";";
      }
      return "";
    },


    /**
     * Sets the transform-origin property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
     * @param el {Element} The dom element to set the property.
     * @param value {String} CSS position values like <code>50% 50%</code> or
     *   <code>left top</code>.
     */
    setOrigin : function(el, value) {
      if (this.__cssKeys != null) {
        el.style[this.__cssKeys["origin"]] = value;
      }
    },


    /**
     * Returns the transform-origin property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-origin-property
     * @param el {Element} The dom element to read the property.
     * @return {String} The set property, e.g. <code>50% 50%</code>
     */
    getOrigin : function(el) {
      if (this.__cssKeys != null) {
        return el.style[this.__cssKeys["origin"]];
      }
      return "";
    },


    /**
     * Sets the transform-style property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
     * @param el {Element} The dom element to set the property.
     * @param value {String} Either <code>flat</code> or <code>preserve-3d</code>.
     */
    setStyle : function(el, value) {
      if (this.__cssKeys != null) {
        el.style[this.__cssKeys["style"]] = value;
      }
    },


    /**
     * Returns the transform-style property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#transform-style-property
     * @param el {Element} The dom element to read the property.
     * @return {String} The set property, either <code>flat</code> or
     *   <code>preserve-3d</code>.
     */
    getStyle : function(el) {
      if (this.__cssKeys != null) {
        return el.style[this.__cssKeys["style"]];
      }
      return "";
    },


    /**
     * Sets the perspective property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
     * @param el {Element} The dom element to set the property.
     * @param value {Number} The perspective layer. Numbers between 100
     *   and 5000 give the best results.
     */
    setPerspective : function(el, value) {
      if (this.__cssKeys != null) {
        el.style[this.__cssKeys["perspective"]] = value;
      }
    },


    /**
     * Returns the perspective property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-property
     * @param el {Element} The dom element to read the property.
     * @return {String} The set property, e.g. <code>500</code>
     */
    getPerspective : function(el) {
      if (this.__cssKeys != null) {
        return el.style[this.__cssKeys["perspective"]];
      }
      return "";
    },


    /**
     * Sets the perspective-origin property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
     * @param el {Element} The dom element to set the property.
     * @param value {String} CSS position values like <code>50% 50%</code> or
     *   <code>left top</code>.
     */
    setPerspectiveOrigin : function(el, value) {
      if (this.__cssKeys != null) {
        el.style[this.__cssKeys["perspective-origin"]] = value;
      }
    },


    /**
     * Returns the perspective-origin property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#perspective-origin-property
     * @param el {Element} The dom element to read the property.
     * @return {String} The set property, e.g. <code>50% 50%</code>
     */
    getPerspectiveOrigin : function(el) {
      if (this.__cssKeys != null) {
        var value = el.style[this.__cssKeys["perspective-origin"]];
        if (value != "") {
          return value;
        } else {
          var valueX = el.style[this.__cssKeys["perspective-origin"] + "X"];
          var valueY = el.style[this.__cssKeys["perspective-origin"] + "Y"];
          if (valueX != "") {
            return valueX + " " + valueY;
          }
        }
      }
      return "";
    },


    /**
     * Sets the backface-visibility property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
     * @param el {Element} The dom element to set the property.
     * @param value {Boolean} <code>true</code> if the backface should be visible.
     */
    setBackfaceVisibility : function(el, value) {
      if (this.__cssKeys != null) {
        el.style[this.__cssKeys["backface-visibility"]] = value ? "visible" : "hidden";
      }
    },


    /**
     * Returns the backface-visibility property of the given element.
     *
     * Spec: http://www.w3.org/TR/css3-3d-transforms/#backface-visibility-property
     * @param el {Element} The dom element to read the property.
     * @return {Boolean} <code>true</code>, if the backface is visible.
     */
    getBackfaceVisibility : function(el) {
      if (this.__cssKeys != null) {
        return el.style[this.__cssKeys["backface-visibility"]] == "visible";
      }
      return true;
    },


    /**
     * Internal helper which converts the given transforms map to a valid CSS
     * string.
     * @param transforms {Map} A map containing the transforms.
     * @return {String} The CSS transforms.
     */
    __mapToCss : function(transforms) {
      var value = "";
      for (var func in transforms) {

        var params = transforms[func];
        // if an array is given
        if (qx.Bootstrap.isArray(params)) {
          for (var i=0; i < params.length; i++) {
            if (params[i] == undefined) {
              continue;
            }
            value += func + this.__dimensions[i] + "(";
            value += params[i];
            value += ") ";
          };
        // case for single values given
        } else {
          // single value case
          value += func + "(" + transforms[func] + ") ";
        }
      }

      return value;
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/* ************************************************************************

#ignore(qx.bom.element.Style)

************************************************************************ */

/**
 * This class offers the same API as the CSS3 animation layer in
 * {@link qx.bom.element.AnimationCss} but uses JavaScript to fake the behavior.
 *
 * {@link qx.bom.element.Animation} is the class, which takes care of the
 * feature detection for CSS animations and decides which implementation
 * (CSS or JavaScript) should be used. Most likely, this implementation should
 * be the one to use.
 */
qx.Bootstrap.define("qx.bom.element.AnimationJs",
{
  statics :
  {
    /**
     * The maximal time a frame should take.
     */
    __maxStepTime : 30,

    /**
     * The supported CSS units.
     */
    __units : ["%", "in", "cm", "mm", "em", "ex", "pt", "pc", "px"],


    /**
     * This is the main function to start the animation. For further details,
     * take a look at the documentation of the wrapper
     * {@link qx.bom.element.Animation}.
     * @param el {Element} The element to animate.
     * @param desc {Map} Animation description.
     * @param duration {Integer?} The duration of the animation which will
     *   override the duration given in the description.
     * @return {qx.bom.element.AnimationHandle} The handle.
     */
    animate : function(el, desc, duration) {
      return this._animate(el, desc, duration, false);
    },


    /**
     * This is the main function to start the animation in reversed mode.
     * For further details, take a look at the documentation of the wrapper
     * {@link qx.bom.element.Animation}.
     * @param el {Element} The element to animate.
     * @param desc {Map} Animation description.
     * @param duration {Integer?} The duration of the animation which will
     *   override the duration given in the description.
     * @return {qx.bom.element.AnimationHandle} The handle.
     */
    animateReverse : function(el, desc, duration) {
      return this._animate(el, desc, duration, true);
    },


    /**
     * Helper to start the animation, either in reversed order or not.
     *
     * @param el {Element} The element to animate.
     * @param desc {Map} Animation description.
     * @param duration {Integer?} The duration of the animation which will
     *   override the duration given in the description.
     * @param reverse {Boolean} <code>true</code>, if the animation should be
     *   reversed.
     * @return {qx.bom.element.AnimationHandle} The handle.
     */
    _animate : function(el, desc, duration, reverse) {
      // stop if an animation is already running
      if (el.$$animation) {
        return;
      }

      // @deprecated since 2.0
      if (desc.hasOwnProperty("reverse")) {
        reverse = desc.reverse;
        if (qx.core.Environment.get("qx.debug")) {
          qx.log.Logger.warn(
            "The key 'reverse' is deprecated: Please use the method " +
            "'animateReverse' instead."
          );
          qx.log.Logger.trace();
        }
      }

      if (duration == undefined) {
        duration = desc.duration;
      }

      var keyFrames = desc.keyFrames;

      var keys = this.__getOrderedKeys(keyFrames);
      var stepTime = this.__getStepTime(duration, keys);
      var steps = parseInt(duration / stepTime, 10);

      this.__normalizeKeyFrames(keyFrames, el);

      var delta = this.__calculateDelta(steps, stepTime, keys, keyFrames, duration, desc.timing);
      var handle = new qx.bom.element.AnimationHandle();

      if (reverse) {
        delta.reverse();
        handle.reverse = true;
      }

      handle.desc = desc;
      handle.el = el;
      handle.delta = delta;
      handle.stepTime = stepTime;
      handle.steps = steps;
      el.$$animation = handle;

      handle.i = 0;
      handle.initValues = {};
      handle.repeatSteps = this.__applyRepeat(steps, desc.repeat);

      return this.play(handle);
    },


    /**
     * Try to normalize the keyFrames by adding the default / set values of the
     * element.
     * @param keyFrames {Map} The map of key frames.
     * @param el {Element} The element to animate.
     */
    __normalizeKeyFrames : function(keyFrames, el) {
      // collect all possible keys and its units
      var units = {};
      for (var percent in keyFrames) {
        for (var name in keyFrames[percent]) {
          if (units[name] == undefined) {
            var item = keyFrames[percent][name];
            if (typeof item == "string") {
              units[name] = item.substring((parseInt(item, 10)+"").length, item.length);
            } else {
              units[name] = "";
            }
          }
        };
      }
      // add all missing keys
      for (var percent in keyFrames) {
        var frame = keyFrames[percent];
        for (var name in units) {
          if (frame[name] == undefined) {
            // get the computed style if possible
            if (window.getComputedStyle) {
              frame[name] = getComputedStyle(el, null)[name];
            } else {
              frame[name] = el.style[name];
            }
            // if its a unit we know, set 0 as fallback
            if (frame[name] == "" && this.__units.indexOf(units[name]) != -1) {
              frame[name] = "0" + units[name];
            }
          }
        };
      };
    },


    /**
     * Precalculation of the delta which will be applied during the animation.
     * The whole deltas will be calculated prior to the animation and stored
     * in a single array. This method takes care of that calculation.
     *
     * @param steps {Integer} The amount of steps to take to the end of the
     *   animation.
     * @param stepTime {Integer} The amount of milliseconds each step takes.
     * @param keys {Array} Ordered list of keys in the key frames map.
     * @param keyFrames {Map} The map of key frames.
     * @param duration {Integer} Time in milliseconds the animation should take.
     * @param timing {String} The given timing function.
     * @return {Array} An array containing the animation deltas.
     */
    __calculateDelta : function(steps, stepTime, keys, keyFrames, duration, timing) {
      var delta = new Array(steps);

      var keyIndex = 1;
      delta[0] = keyFrames[0];
      var last = keyFrames[0];
      var next = keyFrames[keys[keyIndex]];

      // for every step
      for (var i=1; i < delta.length; i++) {
        // switch key frames if we crossed a percent border
        if (i * stepTime / duration * 100 > keys[keyIndex]) {
          last = next;
          keyIndex++;
          next = keyFrames[keys[keyIndex]];
        }

        delta[i] = {};

        // for every property
        for (var name in next) {
          var nItem = next[name] + "";
          // color values
          if (nItem.charAt(0) == "#") {
            // get the two values from the frames as RGB arrays
            var value0 = qx.util.ColorUtil.cssStringToRgb(last[name]);
            var value1 = qx.util.ColorUtil.cssStringToRgb(nItem);
            var stepValue = [];
            // calculate every color chanel
            for (var j=0; j < value0.length; j++) {
              var range = value0[j] - value1[j];
              stepValue[j] = parseInt(value0[j] - range * this.__calculateTiming(timing, i / steps), 10);
            };

            delta[i][name] = qx.util.ColorUtil.rgbToHexString(stepValue);

          } else if (!isNaN(parseInt(nItem, 10))) {
            var unit = nItem.substring((parseInt(nItem, 10)+"").length, nItem.length);
            var range = parseFloat(nItem) - parseFloat(last[name]);
            delta[i][name] = (parseFloat(last[name]) + range * this.__calculateTiming(timing, i / steps)) + unit;
          } else {
            delta[i][name] = last[name] + "";
          }

        };
      };
      // make sure the last key frame is right
      delta[delta.length -1] = keyFrames[100];
      return delta;
    },


    /**
     * Internal helper for the {@link qx.bom.element.AnimationHandle} to play
     * the animation.
     * @internal
     * @param handle {qx.bom.element.AnimationHandle} The hand which
     *   represents the animation.
     * @return {qx.bom.element.AnimationHandle} The handle for chaining.
     */
    play : function(handle) {
      var id = window.setInterval(function() {
        handle.repeatSteps--;
        var values = handle.delta[handle.i % handle.steps];
        // save the init values
        if (handle.i == 0) {
          for (var name in values) {
            if (handle.initValues[name] == undefined) {
              if (qx.bom.element.Style) {
                handle.initValues[name] = qx.bom.element.Style.get(
                  handle.el, qx.lang.String.camelCase(name)
                );
              } else {
                handle.initValues[name] = handle.el.style[qx.lang.String.camelCase(name)];
              }
            }
          }
        }
        qx.bom.element.AnimationJs.__applyStyles(handle.el, values);

        handle.i++;
        // iteration condition
        if (handle.i % handle.steps == 0) {
          if (handle.desc.alternate) {
            handle.delta.reverse();
          }
        }
        // end condition
        if (handle.repeatSteps < 0) {
          qx.bom.element.AnimationJs.stop(handle);
        }
      }, handle.stepTime);

      handle.animationId = id;

      return handle;
    },


    /**
     * Internal helper for the {@link qx.bom.element.AnimationHandle} to pause
     * the animation.
     * @internal
     * @param handle {qx.bom.element.AnimationHandle} The hand which
     *   represents the animation.
     * @return {qx.bom.element.AnimationHandle} The handle for chaining.
     */

    pause : function(handle) {
      // stop the interval
      window.clearInterval(handle.animationId);
      handle.animationId = null;
    },


    /**
     * Internal helper for the {@link qx.bom.element.AnimationHandle} to stop
     * the animation.
     * @internal
     * @param handle {qx.bom.element.AnimationHandle} The hand which
     *   represents the animation.
     * @return {qx.bom.element.AnimationHandle} The handle for chaining.
     */
    stop : function(handle) {
      var desc = handle.desc;
      var el = handle.el;
      var initValues = handle.initValues;
      if (handle.animationId) {
        window.clearInterval(handle.animationId);
      }

      // check if animation is already stopped
      if (el == undefined) {
        return;
      }

      // if we should keep a frame
      var keep = desc.keep;
      if (keep != undefined) {
        if (handle.reverse || (desc.alternate && desc.repeat && desc.repeat % 2 == 0)) {
          keep = 100 - keep;
        }
        this.__applyStyles(el, desc.keyFrames[keep]);
      } else {
        this.__applyStyles(el, initValues);
      }

      el.$$animation = null;
      handle.el = null;
      handle.ended = true;
      handle.animationId = null;

      handle.emit("end", el);
    },


    /**
     * Calculation of the predefined timing functions. Approximations of the real
     * bezier curves has ben used for easier calculation. This is good and close
     * enough for the predefined functions like <code>ease</code> or
     * <code>linear</code>.
     *
     * @param func {String} The defined timing function. One of the following values:
     *   <code>"ease-in"</code>, <code>"ease-out"</code>, <code>"linear"</code>,
     *   <code>"ease-in-out"</code>, <code>"ease"</code>.
     * @param x {Integer} The percent value of the function.
     */
    __calculateTiming : function(func, x) {
      if (func == "ease-in") {
        var a = [3.1223e-7, 0.0757, 1.2646, -0.167, -0.4387, 0.2654];
      } else if (func == "ease-out") {
        var a = [-7.0198e-8, 1.652, -0.551, -0.0458, 0.1255, -0.1807];
      } else if (func == "linear") {
        return x;
      } else if (func == "ease-in-out") {
        var a = [2.482e-7, -0.2289, 3.3466, -1.0857, -1.7354, 0.7034];
      } else {
        // default is 'ease'
        var a = [-0.0021, 0.2472, 9.8054, -21.6869, 17.7611, -5.1226];
      }

      // A 6th grade polynom has been used to approximation function
      // of the original bezier curves  described in the transition spec
      // http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
      // (the same is used for animations as well)
      var y = 0;
      for (var i=0; i < a.length; i++) {
        y += a[i] * Math.pow(x, i);
      };
      return y;
    },


    /**
     * Takes care of the repeat key of the description.
     * @param steps {Integer} The number of steps one iteration would take.
     * @param repeat {Integer|String} It can be either a number how often the
     * animation should be repeated or the string 'infinite'.
     * @return {Integer} The number of steps to animate.
     */
    __applyRepeat : function(steps, repeat) {
      if (repeat == undefined) {
        return steps;
      }
      if (repeat == "infinite") {
        return Number.MAX_VALUE;
      }
      return steps * repeat;
    },


    /**
     * Central method to apply css styles.
     * @param el {Element} The DOM element to apply the styles.
     * @param styles {Map} A map containing styles and values.
     */
    __applyStyles : function(el, styles) {
      for (var key in styles) {
        // ignore undefined values (might be a bad detection)
        if (styles[key] === undefined) {
          continue;
        }
        var name = qx.lang.String.camelCase(key);
        if (qx.bom.element.Style) {
          qx.bom.element.Style.set(el, name, styles[key]);
        } else {
          el.style[name] = styles[key];
        }
      }
    },


    /**
     * Dynamic calculation of the steps time considering a max step time.
     * @param duration {Number} The duration of the animation.
     * @param keys {Array} An array containing the orderd set of key frame keys.
     * @return {Integer} The best suited step time.
     */
    __getStepTime : function(duration, keys) {
      // get min difference
      var minDiff = 100;
      for (var i=0; i < keys.length - 1; i++) {
        minDiff = Math.min(minDiff, keys[i+1] - keys[i])
      };

      var stepTime = duration * minDiff / 100;
      while (stepTime > this.__maxStepTime) {
        stepTime = stepTime / 2;
      }
      return Math.round(stepTime);
    },


    /**
     * Helper which returns the orderd keys of the key frame map.
     * @param keyFrames {Map} The map of key frames.
     * @return {Array} An orderd list of kyes.
     */
    __getOrderedKeys : function(keyFrames) {
      var keys = qx.Bootstrap.getKeys(keyFrames);
      for (var i=0; i < keys.length; i++) {
        keys[i] = parseInt(keys[i], 10);
      };
      keys.sort(function(a,b) {return a-b;});
      return keys;
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A split panes divides an area into two panes. The ratio between the two
 * panes is configurable by the user using the splitter.
 *
 * @childControl slider {qx.ui.splitpane.Slider} shown during resizing the splitpane
 * @childControl splitter {qx.ui.splitpane.Splitter} splitter to resize the splitpane
 */
qx.Class.define("qx.ui.splitpane.Pane",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of a SplitPane. It allows the user to dynamically
   * resize the areas dropping the border between.
   *
   * @param orientation {String} The orientation of the split pane control.
   * Allowed values are "horizontal" (default) and "vertical".
   */
  construct : function(orientation)
  {
    this.base(arguments);

    this.__children = [];

    // Initialize orientation
    if (orientation) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

    // add all mouse listener to the blocker
    this.__blocker.addListener("mousedown", this._onMouseDown, this);
    this.__blocker.addListener("mouseup", this._onMouseUp, this);
    this.__blocker.addListener("mousemove", this._onMouseMove, this);
    this.__blocker.addListener("mouseout", this._onMouseOut, this);
    this.__blocker.addListener("losecapture", this._onMouseUp, this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "splitpane"
    },

    /**
     * Distance between mouse cursor and splitter when the cursor should change
     * and enable resizing.
     */
    offset :
    {
      check : "Integer",
      init : 6,
      apply : "_applyOffset"
    },

    /**
     * The orientation of the splitpane control.
     */
    orientation :
    {
      init  : "horizontal",
      check : [ "horizontal", "vertical" ],
      apply : "_applyOrientation"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __splitterOffset : null,
    __activeDragSession : false,
    __lastMouseX : null,
    __lastMouseY : null,
    __isHorizontal : null,
    __beginSize : null,
    __endSize : null,
    __children : null,
    __blocker : null,


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        // Create and add slider
        case "slider":
          control = new qx.ui.splitpane.Slider(this);
          control.exclude();
          this._add(control, {type : id});
          break;

        // Create splitter
        case "splitter":
          control = new qx.ui.splitpane.Splitter(this);
          this._add(control, {type : id});
          control.addListener("move", this.__onSplitterMove, this);
          break;
      }

      return control || this.base(arguments, id);
    },


    /**
     * Move handler for the spliiter which takes care of the external
     * triggered resize of children.
     *
     * @param e {qx.event.type.Data} The data even of move.
     */
    __onSplitterMove : function(e) {
      this.__setBlockerPosition(e.getData());
    },


    /**
     * Creates a blocker for the splitter which takes all bouse events and
     * also handles the offset and cursor.
     *
     * @param orientation {String} The orientation of the pane.
     */
    __createBlocker : function(orientation) {
      this.__blocker = new qx.ui.splitpane.Blocker(orientation);
      this.getContentElement().add(this.__blocker);

      var splitter = this.getChildControl("splitter");
      var splitterWidth = splitter.getWidth();
      if (!splitterWidth) {
        splitter.addListenerOnce("appear", function() {
          this.__setBlockerPosition();
        }, this);
      }

      // resize listener to remove the blocker in case the splitter
      // is removed.
      splitter.addListener("resize", function(e) {
        var bounds = e.getData();
        if (bounds.height == 0 || bounds.width == 0) {
          this.__blocker.hide();
        } else {
          this.__blocker.show();
        }
      }, this);
    },


    /**
     * Returns the blocker used over the splitter. this could be used for
     * adding event listeners like click or dblclick.
     *
     * @return {qx.ui.splitpane.Blocker} The used blocker element.
     *
     * @internal
     */
    getBlocker : function() {
      return this.__blocker;
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Apply routine for the orientation property.
     *
     * Sets the pane's layout to vertical or horizontal split layout.
     *
     * @param value {String} The new value of the orientation property
     * @param old {String} The old value of the orientation property
     */
    _applyOrientation : function(value, old)
    {
      var slider = this.getChildControl("slider");
      var splitter = this.getChildControl("splitter");

      // Store boolean flag for faster access
      this.__isHorizontal = value === "horizontal";

      if (!this.__blocker) {
        this.__createBlocker(value);
      }

      // update the blocker
      this.__blocker.setOrientation(value);

      // Dispose old layout
      var oldLayout = this._getLayout();
      if (oldLayout) {
        oldLayout.dispose();
      }

      // Create new layout
      var newLayout = value === "vertical" ?
        new qx.ui.splitpane.VLayout : new qx.ui.splitpane.HLayout;
      this._setLayout(newLayout);

      // Update states for splitter and slider
      splitter.removeState(old);
      splitter.addState(value);
      splitter.getChildControl("knob").removeState(old);
      splitter.getChildControl("knob").addState(value);
      slider.removeState(old);
      slider.addState(value);

      // flush (needs to be done for the blocker update) and update the blocker
      qx.ui.core.queue.Manager.flush();
      this.__setBlockerPosition();
    },


    // property apply
    _applyOffset : function(value, old) {
      this.__setBlockerPosition();
    },


    /**
     * Helper for setting the blocker to the right position, which depends on
     * the offset, orientation and the current position of the splitter.
     *
     * @param bounds {Map?null} If the bounds of the splitter are known,
     *   they can be added.
     */
    __setBlockerPosition : function(bounds) {
      var splitter = this.getChildControl("splitter");
      var offset = this.getOffset();
      var splitterBounds = splitter.getBounds();
      var splitterElem = splitter.getContainerElement().getDomElement();

      // do nothing if the splitter is not ready
      if (!splitterElem) {
        return;
      }

      // recalculate the dimensions of the blocker
      if (this.__isHorizontal) {
        // get the width either of the given bounds or of the read bounds
        var width = null;
        if (bounds) {
          width = bounds.width;
        } else if (splitterBounds) {
          width = splitterBounds.width;
        }
        var left = bounds && bounds.left;

        if (width) {
          if (isNaN(left)) {
            left = qx.bom.element.Location.getPosition(splitterElem).left;
          }
          this.__blocker.setWidth(offset, width);
          this.__blocker.setLeft(offset, left);
        }

      // vertical case
      } else {
        // get the height either of the given bounds or of the read bounds
        var height = null;
        if (bounds) {
          height = bounds.height;
        } else if (splitterBounds) {
          height = splitterBounds.height;
        }
        var top =  bounds && bounds.top;

        if (height) {
          if (isNaN(top)) {
            top = qx.bom.element.Location.getPosition(splitterElem).top;
          }
          this.__blocker.setHeight(offset, height);
          this.__blocker.setTop(offset, top);
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a widget to the pane.
     *
     * Sets the pane's layout to vertical or horizontal split layout. Depending on the
     * pane's layout the first widget will be the left or top widget, the second one
     * the bottom or right widget. Adding more than two widgets will overwrite the
     * existing ones.
     *
     * @param widget {qx.ui.core.Widget} The widget to be inserted into pane.
     * @param flex {Number} The (optional) layout property for the widget's flex value.
     */
    add : function(widget, flex)
    {
      if (flex == null) {
        this._add(widget);
      } else {
        this._add(widget, {flex : flex});
      }
      this.__children.push(widget);
    },


    /**
     * Removes the given widget from the pane.
     *
     * @param widget {qx.ui.core.Widget} The widget to be removed.
     */
    remove : function(widget)
    {
      this._remove(widget);
      qx.lang.Array.remove(this.__children, widget);
    },


    /**
     * Returns an array containing the pane's content.
     *
     * @return {qx.ui.core.Widget[]} The pane's child widgets
     */
    getChildren : function() {
      return this.__children;
    },


    /*
    ---------------------------------------------------------------------------
      MOUSE LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Handler for mousedown event.
     *
     * Shows slider widget and starts drag session if mouse is near/on splitter widget.
     *
     * @param e {qx.event.type.Mouse} mouseDown event
     */
    _onMouseDown : function(e)
    {
      // Only proceed if left mouse button is pressed and the splitter is active
      if (!e.isLeftPressed()) {
        return;
      }

      var splitter = this.getChildControl("splitter");

      // Store offset between mouse event coordinates and splitter
      var splitterLocation = splitter.getContainerLocation();
      var paneLocation = this.getContentLocation();
      this.__splitterOffset = this.__isHorizontal ?
        e.getDocumentLeft() - splitterLocation.left + paneLocation.left :
        e.getDocumentTop() - splitterLocation.top + paneLocation.top ;

      // Synchronize slider to splitter size and show it
      var slider = this.getChildControl("slider");
      var splitterBounds = splitter.getBounds();
      slider.setUserBounds(
        splitterBounds.left, splitterBounds.top,
        splitterBounds.width, splitterBounds.height
      );

      slider.setZIndex(splitter.getZIndex() + 1);
      slider.show();

      // Enable session
      this.__activeDragSession = true;
      this.__blocker.capture();

      e.stop();
    },


    /**
     * Handler for mousemove event.
     *
     * @param e {qx.event.type.Mouse} mouseMove event
     */
    _onMouseMove : function(e)
    {
      this._setLastMousePosition(e.getDocumentLeft(), e.getDocumentTop());

      // Check if slider is already being dragged
      if (this.__activeDragSession)
      {
        // Compute new children sizes
        this.__computeSizes();

        // Update slider position
        var slider = this.getChildControl("slider");
        var pos = this.__beginSize;

        if(this.__isHorizontal) {
          slider.setDomLeft(pos);
          this.__blocker.setStyle("left", (pos - this.getOffset()) + "px");
        } else {
          slider.setDomTop(pos);
          this.__blocker.setStyle("top", (pos - this.getOffset()) + "px");
        }

        e.stop();
      }
    },


    /**
     * Handler for mouseout event
     *
     * @param e {qx.event.type.Mouse} mouseout event
     */
    _onMouseOut : function(e)
    {
      this._setLastMousePosition(e.getDocumentLeft(), e.getDocumentTop());
    },


    /**
     * Handler for mouseup event
     *
     * Sets widget sizes if dragging session has been active.
     *
     * @param e {qx.event.type.Mouse} mouseup event
     */
    _onMouseUp : function(e)
    {
      if (!this.__activeDragSession) {
        return;
      }

      // Set sizes to both widgets
      this._finalizeSizes();

      // Hide the slider
      var slider = this.getChildControl("slider");
      slider.exclude();

      // Cleanup
      this.__activeDragSession = false;
      this.releaseCapture();

      e.stop();
    },


    /*
    ---------------------------------------------------------------------------
      INTERVAL HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Updates widgets' sizes based on the slider position.
     */
    _finalizeSizes : function()
    {
      var beginSize = this.__beginSize;
      var endSize = this.__endSize;

      if (beginSize == null) {
        return;
      }

      var children = this._getChildren();
      var firstWidget = children[2];
      var secondWidget = children[3];

      // Read widgets' flex values
      var firstFlexValue = firstWidget.getLayoutProperties().flex;
      var secondFlexValue = secondWidget.getLayoutProperties().flex;

      // Both widgets have flex values
      if((firstFlexValue != 0) && (secondFlexValue != 0))
      {
        firstWidget.setLayoutProperties({ flex : beginSize });
        secondWidget.setLayoutProperties({ flex : endSize });
      }

      // Update both sizes
      else
      {
        // Set widths to static widgets
        if (this.__isHorizontal)
        {
          firstWidget.setWidth(beginSize);
          secondWidget.setWidth(endSize);
        }
        else
        {
          firstWidget.setHeight(beginSize);
          secondWidget.setHeight(endSize);
        }
      }
    },


    /**
     * Computes widgets' sizes based on the mouse coordinate.
     */
    __computeSizes : function()
    {
      if (this.__isHorizontal) {
        var min="minWidth", size="width", max="maxWidth", mouse=this.__lastMouseX;
      } else {
        var min="minHeight", size="height", max="maxHeight", mouse=this.__lastMouseY;
      }

      var children = this._getChildren();
      var beginHint = children[2].getSizeHint();
      var endHint = children[3].getSizeHint();

      // Area given to both widgets
      var allocatedSize = children[2].getBounds()[size] + children[3].getBounds()[size];

      // Calculate widget sizes
      var beginSize = mouse - this.__splitterOffset;
      var endSize = allocatedSize - beginSize;

      // Respect minimum limits
      if (beginSize < beginHint[min])
      {
        endSize -= beginHint[min] - beginSize;
        beginSize = beginHint[min];
      }
      else if (endSize < endHint[min])
      {
        beginSize -= endHint[min] - endSize;
        endSize = endHint[min];
      }

      // Respect maximum limits
      if (beginSize > beginHint[max])
      {
        endSize += beginSize - beginHint[max];
        beginSize = beginHint[max];
      }
      else if (endSize > endHint[max])
      {
        beginSize += endSize - endHint[max];
        endSize = endHint[max];
      }

      // Store sizes
      this.__beginSize = beginSize;
      this.__endSize = endSize;
    },


    /**
     * Determines whether this is an active drag session
     *
     * @return {Boolean} True if active drag session, otherwise false.
     */
    _isActiveDragSession : function() {
      return this.__activeDragSession;
    },


    /**
     * Sets the last mouse position.
     *
     * @param x {Integer} the x position of the mouse cursor.
     * @param y {Integer} the y position of the mouse cursor.
     */
     _setLastMousePosition : function(x, y)
     {
       this.__lastMouseX = x;
       this.__lastMouseY = y;
     }
  },


  destruct : function() {
    this.__children = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The slider of the SplitPane (used during drag sessions for fast feedback)
 *
 * @internal
 */
qx.Class.define("qx.ui.splitpane.Slider",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overrridden
    allowShrinkX :
    {
      refine : true,
      init : false
    },

    // overrridden
    allowShrinkY :
    {
      refine : true,
      init : false
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The splitter is the element between the two panes.
 *
 * @internal
 *
 * @childControl knob {qx.ui.basic.Image} knob to resize the splitpane
 */
qx.Class.define("qx.ui.splitpane.Splitter",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param parentWidget {qx.ui.splitpane.Pane} The underlaying split pane.
   */
  construct : function(parentWidget)
  {
    this.base(arguments);

    // set layout
    if (parentWidget.getOrientation() == "vertical")
    {
      this._setLayout(new qx.ui.layout.HBox(0, "center"));
      this._getLayout().setAlignY("middle");
    }
    else
    {
      this._setLayout(new qx.ui.layout.VBox(0, "middle"));
      this._getLayout().setAlignX("center");
    }

    // create knob child control
    this._createChildControl("knob");
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overrridden
    allowShrinkX :
    {
      refine : true,
      init : false
    },

    // overrridden
    allowShrinkY :
    {
      refine : true,
      init : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        // Create splitter knob
        case "knob":
          control = new qx.ui.basic.Image;
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/* ************************************************************************

#asset(qx/static/blank.gif)

************************************************************************ */
/**
 * A special blocker element for the splitpane which is based on
 * {@link qx.html.Element} and takes care of the positioning of the div.
 * @internal
 */
qx.Class.define("qx.ui.splitpane.Blocker",
{
  extend : qx.html.Element,

  /**
   * @param orientation {String} The orientation of the split pane control.
   */
  construct : function(orientation)
  {
    var styles = {
      position: "absolute",
      zIndex: 11
    };

    // IE needs some extra love here to convince it to block events.
    if ((qx.core.Environment.get("engine.name") == "mshtml"))
    {
      styles.backgroundImage = "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")";
      styles.backgroundRepeat = "repeat";
    }

    this.base(arguments, "div", styles);

    // Initialize orientation
    if (orientation) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
  },


  properties :
  {
    /**
     * The orientation of the blocker which should be the same as the
     * orientation of the splitpane.
     */
    orientation :
    {
      init  : "horizontal",
      check : [ "horizontal", "vertical" ],
      apply : "_applyOrientation"
    }
  },


  members :
  {

    // property apply
    _applyOrientation : function(value, old) {
      if (value == "horizontal") {
        this.setStyle("height", "100%");
        this.setStyle("cursor", "col-resize");
        this.setStyle("top", null);
      } else {
        this.setStyle("width", "100%");
        this.setStyle("left", null);
        this.setStyle("cursor", "row-resize");
      }
    },


    /**
     * Takes the two parameters and set the propper width of the blocker.
     *
     * @param offset {Number} The offset of the splitpane.
     * @param spliterSize {Number} The width of the splitter.
     */
    setWidth : function(offset, spliterSize) {
      var width = spliterSize + 2 * offset;
      this.setStyle("width", width + "px");
    },


    /**
     * Takes the two parameter and sets the propper height of the blocker.
     *
     * @param offset {Number} The offset of the splitpane.
     * @param spliterSize {Number} The height of the splitter.
     */
    setHeight : function(offset, spliterSize) {
      var height = spliterSize + 2 * offset;
      this.setStyle("height", height + "px");
    },


    /**
     * Takes the two parameter and sets the propper left position of
     * the blocker.
     *
     * @param offset {Number} The offset of the splitpane.
     * @param splitterLeft {Number} The left position of the splitter.
     */
    setLeft : function(offset, splitterLeft) {
      var left = splitterLeft - offset;
      this.setStyle("left", left + "px");
    },


    /**
     * Takes the two parameter and sets the propper top position of
     * the blocker.
     *
     * @param offset {Number} The offset of the splitpane.
     * @param splitterTop {Number} The top position of the splitter.
     */
    setTop : function(offset, splitterTop) {
      var top = splitterTop - offset;
      this.setStyle("top", top + "px");
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Layouter for vertical split panes.
 *
 * @internal
 */
qx.Class.define("qx.ui.splitpane.VLayout",
{
  extend : qx.ui.layout.Abstract,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    verifyLayoutProperty : qx.core.Environment.select("qx.debug",
    {
      "true" : function(item, name, value)
      {
        this.assert(name === "type" || name === "flex", "The property '"+name+"' is not supported by the split layout!");

        if (name == "flex") {
          this.assertNumber(value);
        }

        if (name == "type") {
          this.assertString(value);
        }
      },

      "false" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var children = this._getLayoutChildren();
      var length = children.length;
      var child, type;
      var begin, splitter, slider, end;

      for (var i=0; i<length; i++)
      {
        child = children[i];
        type = child.getLayoutProperties().type;

        if (type === "splitter") {
          splitter = child;
        } else if (type === "slider") {
          slider = child;
        } else if (!begin) {
          begin = child;
        } else {
          end = child;
        }
      }

      if (begin && end)
      {
        var beginFlex = begin.getLayoutProperties().flex;
        var endFlex = end.getLayoutProperties().flex;

        if (beginFlex == null) {
          beginFlex = 1;
        }

        if (endFlex == null) {
          endFlex = 1;
        }

        var beginHint = begin.getSizeHint();
        var splitterHint = splitter.getSizeHint();
        var endHint = end.getSizeHint();

        var beginHeight = beginHint.height;
        var splitterHeight = splitterHint.height;
        var endHeight = endHint.height;

        if (beginFlex > 0 && endFlex > 0)
        {
          var flexSum = beginFlex + endFlex;
          var flexAvailable = availHeight - splitterHeight;

          var beginHeight = Math.round((flexAvailable / flexSum) * beginFlex);
          var endHeight = flexAvailable - beginHeight;

          var sizes = qx.ui.layout.Util.arrangeIdeals(beginHint.minHeight, beginHeight, beginHint.maxHeight,
            endHint.minHeight, endHeight, endHint.maxHeight);

          beginHeight = sizes.begin;
          endHeight = sizes.end;
        }
        else if (beginFlex > 0)
        {
          beginHeight = availHeight - splitterHeight - endHeight;
          if (beginHeight < beginHint.minHeight) {
            beginHeight = beginHint.minHeight;
          }

          if (beginHeight > beginHint.maxHeight) {
            beginHeight = beginHint.maxHeight;
          }
        }
        else if (endFlex > 0)
        {
          endHeight = availHeight - beginHeight - splitterHeight;
          if (endHeight < endHint.minHeight) {
            endHeight = endHint.minHeight;
          }

          if (endHeight > endHint.maxHeight) {
            endHeight = endHint.maxHeight;
          }
        }

        begin.renderLayout(0, 0, availWidth, beginHeight);
        splitter.renderLayout(0, beginHeight, availWidth, splitterHeight);
        end.renderLayout(0, beginHeight+splitterHeight, availWidth, endHeight);
      }
      else
      {
        // Hide the splitter completely
        splitter.renderLayout(0, 0, 0, 0);

        // Render one child
        if (begin) {
          begin.renderLayout(0, 0, availWidth, availHeight);
        } else if (end) {
          end.renderLayout(0, 0, availWidth, availHeight);
        }
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var length = children.length;
      var child, hint, props;
      var minHeight=0, height=0, maxHeight=0;
      var minWidth=0, width=0, maxWidth=0;

      for (var i=0; i<length; i++)
      {
        child = children[i];
        props = child.getLayoutProperties();

        // The slider is not relevant for auto sizing
        if (props.type === "slider") {
          continue;
        }

        hint = child.getSizeHint();

        minHeight += hint.minHeight;
        height += hint.height;
        maxHeight += hint.maxHeight;

        if (hint.minWidth > minWidth) {
          minWidth = hint.minWidth;
        }

        if (hint.width > width) {
          width = hint.width;
        }

        if (hint.maxWidth > maxWidth) {
          maxWidth = hint.maxWidth;
        }
      }

      return {
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight,
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth
      };
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Layouter for horizontal split panes.
 *
 * @internal
 */
qx.Class.define("qx.ui.splitpane.HLayout",
{
  extend : qx.ui.layout.Abstract,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    verifyLayoutProperty : qx.core.Environment.select("qx.debug",
    {
      "true" : function(item, name, value)
      {
        this.assert(name === "type" || name === "flex", "The property '"+name+"' is not supported by the split layout!");

        if (name == "flex") {
          this.assertNumber(value);
        }

        if (name == "type") {
          this.assertString(value);
        }
      },

      "false" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var children = this._getLayoutChildren();
      var length = children.length;
      var child, type;
      var begin, splitter, slider, end;

      for (var i=0; i<length; i++)
      {
        child = children[i];
        type = child.getLayoutProperties().type;

        if (type === "splitter") {
          splitter = child;
        } else if (type === "slider") {
          slider = child;
        } else if (!begin) {
          begin = child;
        } else {
          end = child;
        }
      }

      if (begin && end)
      {
        var beginFlex = begin.getLayoutProperties().flex;
        var endFlex = end.getLayoutProperties().flex;

        if (beginFlex == null) {
          beginFlex = 1;
        }

        if (endFlex == null) {
          endFlex = 1;
        }

        var beginHint = begin.getSizeHint();
        var splitterHint = splitter.getSizeHint();
        var endHint = end.getSizeHint();

        var beginWidth = beginHint.width;
        var splitterWidth = splitterHint.width;
        var endWidth = endHint.width;

        if (beginFlex > 0 && endFlex > 0)
        {
          var flexSum = beginFlex + endFlex;
          var flexAvailable = availWidth - splitterWidth;

          var beginWidth = Math.round((flexAvailable / flexSum) * beginFlex);
          var endWidth = flexAvailable - beginWidth;

          var sizes = qx.ui.layout.Util.arrangeIdeals(beginHint.minWidth, beginWidth, beginHint.maxWidth,
            endHint.minWidth, endWidth, endHint.maxWidth);

          beginWidth = sizes.begin;
          endWidth = sizes.end;
        }
        else if (beginFlex > 0)
        {
          beginWidth = availWidth - splitterWidth - endWidth;
          if (beginWidth < beginHint.minWidth) {
            beginWidth = beginHint.minWidth;
          }

          if (beginWidth > beginHint.maxWidth) {
            beginWidth = beginHint.maxWidth;
          }
        }
        else if (endFlex > 0)
        {
          endWidth = availWidth - beginWidth - splitterWidth;
          if (endWidth < endHint.minWidth) {
            endWidth = endHint.minWidth;
          }

          if (endWidth > endHint.maxWidth) {
            endWidth = endHint.maxWidth;
          }
        }

        begin.renderLayout(0, 0, beginWidth, availHeight);
        splitter.renderLayout(beginWidth, 0, splitterWidth, availHeight);
        end.renderLayout(beginWidth+splitterWidth, 0, endWidth, availHeight);
      }
      else
      {
        // Hide the splitter completely
        splitter.renderLayout(0, 0, 0, 0);

        // Render one child
        if (begin) {
          begin.renderLayout(0, 0, availWidth, availHeight);
        } else if (end) {
          end.renderLayout(0, 0, availWidth, availHeight);
        }
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var length = children.length;
      var child, hint, props;
      var minWidth=0, width=0, maxWidth=0;
      var minHeight=0, height=0, maxHeight=0;

      for (var i=0; i<length; i++)
      {
        child = children[i];
        props = child.getLayoutProperties();

        // The slider is not relevant for auto sizing
        if (props.type === "slider") {
          continue;
        }

        hint = child.getSizeHint();

        minWidth += hint.minWidth;
        width += hint.width;
        maxWidth += hint.maxWidth;

        if (hint.minHeight > minHeight) {
          minHeight = hint.minHeight;
        }

        if (hint.height > height) {
          height = hint.height;
        }

        if (hint.maxHeight > maxHeight) {
          maxHeight = hint.maxHeight;
        }
      }

      return {
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth,
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight
      };
    }
  }
});
