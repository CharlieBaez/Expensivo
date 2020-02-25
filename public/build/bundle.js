
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Navbar.svelte generated by Svelte v3.18.2 */

    const file = "src/Navbar.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let div1;
    	let h1;
    	let t1;
    	let div0;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "¡Expensivo!";
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "...the best way to stick to a budget is to start one";
    			attr_dev(h1, "class", "nav-title");
    			add_location(h1, file, 14, 4, 195);
    			attr_dev(div0, "class", "tagline svelte-170i2hr");
    			add_location(div0, file, 15, 4, 238);
    			attr_dev(div1, "class", "nav-center");
    			add_location(div1, file, 13, 2, 166);
    			attr_dev(nav, "class", "nav");
    			add_location(nav, file, 12, 0, 146);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }
    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/UserModal.svelte generated by Svelte v3.18.2 */
    const file$1 = "src/UserModal.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let div1_intro;
    	let div1_outro;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "modal-content");
    			add_location(div0, file$1, 6, 2, 136);
    			attr_dev(div1, "class", "modal-container");
    			add_location(div1, file$1, 5, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 1) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, blur, {});
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [$$scope, $$slots];
    }

    class UserModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserModal",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/SectionHeader.svelte generated by Svelte v3.18.2 */

    const file$2 = "src/SectionHeader.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t = text(/*SectionHeader*/ ctx[0]);
    			add_location(h2, file$2, 6, 2, 104);
    			attr_dev(div, "class", "main-title");
    			add_location(div, file$2, 5, 0, 77);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*SectionHeader*/ 1) set_data_dev(t, /*SectionHeader*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { SectionHeader = "Section Header" } = $$props;
    	const writable_props = ["SectionHeader"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SectionHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("SectionHeader" in $$props) $$invalidate(0, SectionHeader = $$props.SectionHeader);
    	};

    	$$self.$capture_state = () => {
    		return { SectionHeader };
    	};

    	$$self.$inject_state = $$props => {
    		if ("SectionHeader" in $$props) $$invalidate(0, SectionHeader = $$props.SectionHeader);
    	};

    	return [SectionHeader];
    }

    class SectionHeader_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, { SectionHeader: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SectionHeader_1",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get SectionHeader() {
    		throw new Error("<SectionHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set SectionHeader(value) {
    		throw new Error("<SectionHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/UserNameForm.svelte generated by Svelte v3.18.2 */

    const file$3 = "src/UserNameForm.svelte";

    // (39:4) {#if isEmpty}
    function create_if_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "*please fill out required fields";
    			attr_dev(p, "class", "form-empty");
    			add_location(p, file$3, 39, 6, 920);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(39:4) {#if isEmpty}",
    		ctx
    	});

    	return block;
    }

    // (48:37) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add User Info");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(48:37) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:6) {#if isEditing}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update User Info");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(48:6) {#if isEditing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let t0;
    	let form;
    	let div0;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let div1;
    	let label1;
    	let t5;
    	let input1;
    	let t6;
    	let t7;
    	let button0;
    	let t8;
    	let button1;
    	let i;
    	let t9;
    	let current;
    	let dispose;

    	const sectionheader = new SectionHeader_1({
    			props: { SectionHeader: "Tell us about yourself" },
    			$$inline: true
    		});

    	let if_block0 = /*isEmpty*/ ctx[4] && create_if_block_1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*isEditing*/ ctx[2]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(sectionheader.$$.fragment);
    			t0 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "name*";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Email*";
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			button0 = element("button");
    			if_block1.c();
    			t8 = space();
    			button1 = element("button");
    			i = element("i");
    			t9 = text("\n      close");
    			attr_dev(label0, "for", "username");
    			add_location(label0, file$3, 30, 6, 644);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "username");
    			add_location(input0, file$3, 31, 6, 686);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$3, 29, 4, 611);
    			attr_dev(label1, "for", "email");
    			add_location(label1, file$3, 34, 6, 792);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "id", "date");
    			add_location(input1, file$3, 35, 6, 832);
    			attr_dev(div1, "class", "form-control");
    			add_location(div1, file$3, 33, 4, 759);
    			attr_dev(button0, "type", "submit");
    			attr_dev(button0, "class", "btn btn-block btn-primary");
    			button0.disabled = /*isEmpty*/ ctx[4];
    			toggle_class(button0, "disabled", /*isEmpty*/ ctx[4]);
    			add_location(button0, file$3, 41, 4, 993);
    			attr_dev(i, "class", "fas fa-times");
    			add_location(i, file$3, 50, 6, 1271);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "close-btn");
    			add_location(button1, file$3, 49, 4, 1200);
    			attr_dev(form, "action", "");
    			attr_dev(form, "class", "expense-form");
    			add_location(form, file$3, 28, 2, 529);
    			attr_dev(section, "class", "form");
    			add_location(section, file$3, 26, 0, 445);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(sectionheader, section, null);
    			append_dev(section, t0);
    			append_dev(section, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t2);
    			append_dev(div0, input0);
    			set_input_value(input0, /*userName*/ ctx[0]);
    			append_dev(form, t3);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t5);
    			append_dev(div1, input1);
    			set_input_value(input1, /*email*/ ctx[1]);
    			append_dev(form, t6);
    			if (if_block0) if_block0.m(form, null);
    			append_dev(form, t7);
    			append_dev(form, button0);
    			if_block1.m(button0, null);
    			append_dev(form, t8);
    			append_dev(form, button1);
    			append_dev(button1, i);
    			append_dev(button1, t9);
    			current = true;

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    				listen_dev(
    					button1,
    					"click",
    					function () {
    						if (is_function(/*hideUserForm*/ ctx[3])) /*hideUserForm*/ ctx[3].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[5]), false, true, false)
    			];
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*userName*/ 1 && input0.value !== /*userName*/ ctx[0]) {
    				set_input_value(input0, /*userName*/ ctx[0]);
    			}

    			if (dirty & /*email*/ 2 && input1.value !== /*email*/ ctx[1]) {
    				set_input_value(input1, /*email*/ ctx[1]);
    			}

    			if (/*isEmpty*/ ctx[4]) {
    				if (!if_block0) {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(form, t7);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(button0, null);
    				}
    			}

    			if (!current || dirty & /*isEmpty*/ 16) {
    				prop_dev(button0, "disabled", /*isEmpty*/ ctx[4]);
    			}

    			if (dirty & /*isEmpty*/ 16) {
    				toggle_class(button0, "disabled", /*isEmpty*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionheader);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { userName = "" } = $$props;
    	let { email = "" } = $$props;
    	let { isEditing } = $$props;
    	let { addUserInfo } = $$props;
    	let { hideUserForm } = $$props;

    	const handleSubmit = e => {
    		addUserInfo({ userName, email });
    		hideUserForm();
    	};

    	const writable_props = ["userName", "email", "isEditing", "addUserInfo", "hideUserForm"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UserNameForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		userName = this.value;
    		$$invalidate(0, userName);
    	}

    	function input1_input_handler() {
    		email = this.value;
    		$$invalidate(1, email);
    	}

    	$$self.$set = $$props => {
    		if ("userName" in $$props) $$invalidate(0, userName = $$props.userName);
    		if ("email" in $$props) $$invalidate(1, email = $$props.email);
    		if ("isEditing" in $$props) $$invalidate(2, isEditing = $$props.isEditing);
    		if ("addUserInfo" in $$props) $$invalidate(6, addUserInfo = $$props.addUserInfo);
    		if ("hideUserForm" in $$props) $$invalidate(3, hideUserForm = $$props.hideUserForm);
    	};

    	$$self.$capture_state = () => {
    		return {
    			userName,
    			email,
    			isEditing,
    			addUserInfo,
    			hideUserForm,
    			isEmpty
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("userName" in $$props) $$invalidate(0, userName = $$props.userName);
    		if ("email" in $$props) $$invalidate(1, email = $$props.email);
    		if ("isEditing" in $$props) $$invalidate(2, isEditing = $$props.isEditing);
    		if ("addUserInfo" in $$props) $$invalidate(6, addUserInfo = $$props.addUserInfo);
    		if ("hideUserForm" in $$props) $$invalidate(3, hideUserForm = $$props.hideUserForm);
    		if ("isEmpty" in $$props) $$invalidate(4, isEmpty = $$props.isEmpty);
    	};

    	let isEmpty;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*userName, email*/ 3) {
    			//reactivity
    			 $$invalidate(4, isEmpty = !userName || !email);
    		}
    	};

    	return [
    		userName,
    		email,
    		isEditing,
    		hideUserForm,
    		isEmpty,
    		handleSubmit,
    		addUserInfo,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class UserNameForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$3, safe_not_equal, {
    			userName: 0,
    			email: 1,
    			isEditing: 2,
    			addUserInfo: 6,
    			hideUserForm: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserNameForm",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*isEditing*/ ctx[2] === undefined && !("isEditing" in props)) {
    			console.warn("<UserNameForm> was created without expected prop 'isEditing'");
    		}

    		if (/*addUserInfo*/ ctx[6] === undefined && !("addUserInfo" in props)) {
    			console.warn("<UserNameForm> was created without expected prop 'addUserInfo'");
    		}

    		if (/*hideUserForm*/ ctx[3] === undefined && !("hideUserForm" in props)) {
    			console.warn("<UserNameForm> was created without expected prop 'hideUserForm'");
    		}
    	}

    	get userName() {
    		throw new Error("<UserNameForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userName(value) {
    		throw new Error("<UserNameForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get email() {
    		throw new Error("<UserNameForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error("<UserNameForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isEditing() {
    		throw new Error("<UserNameForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isEditing(value) {
    		throw new Error("<UserNameForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addUserInfo() {
    		throw new Error("<UserNameForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addUserInfo(value) {
    		throw new Error("<UserNameForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideUserForm() {
    		throw new Error("<UserNameForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideUserForm(value) {
    		throw new Error("<UserNameForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Greeting.svelte generated by Svelte v3.18.2 */
    const file$4 = "src/Greeting.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div;
    	let t5;
    	let h1;
    	let t6;
    	let br;
    	let t7;
    	let span;
    	let t8;
    	let t9;
    	let button;
    	let i;
    	let t10;
    	let h2;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			div.textContent = `${/*todayDate*/ ctx[2].getDate()}  ${/*months*/ ctx[3][/*todayDate*/ ctx[2].getMonth()]}, ${/*todayDate*/ ctx[2].getFullYear()}`;
    			t5 = space();
    			h1 = element("h1");
    			t6 = text("Hello,\n    ");
    			br = element("br");
    			t7 = space();
    			span = element("span");
    			t8 = text(/*UserInfoName*/ ctx[0]);
    			t9 = text("\n    !\n    ");
    			button = element("button");
    			i = element("i");
    			t10 = space();
    			h2 = element("h2");
    			h2.textContent = "welcome back";
    			attr_dev(div, "class", "todays-date");
    			add_location(div, file$4, 59, 2, 876);
    			add_location(br, file$4, 64, 4, 1017);
    			attr_dev(span, "class", "svelte-15aq34q");
    			add_location(span, file$4, 65, 4, 1028);
    			attr_dev(i, "class", "fas fa-pen");
    			add_location(i, file$4, 68, 6, 1134);
    			attr_dev(button, "class", "expense-btn edit-btn svelte-15aq34q");
    			add_location(button, file$4, 67, 4, 1066);
    			attr_dev(h1, "class", "svelte-15aq34q");
    			add_location(h1, file$4, 62, 2, 997);
    			attr_dev(h2, "class", "svelte-15aq34q");
    			add_location(h2, file$4, 71, 2, 1183);
    			attr_dev(section, "class", "svelte-15aq34q");
    			add_location(section, file$4, 58, 0, 864);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(section, t5);
    			append_dev(section, h1);
    			append_dev(h1, t6);
    			append_dev(h1, br);
    			append_dev(h1, t7);
    			append_dev(h1, span);
    			append_dev(span, t8);
    			append_dev(h1, t9);
    			append_dev(h1, button);
    			append_dev(button, i);
    			append_dev(section, t10);
    			append_dev(section, h2);

    			dispose = listen_dev(
    				button,
    				"click",
    				function () {
    					if (is_function(/*showUserForm*/ ctx[1])) /*showUserForm*/ ctx[1].apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*UserInfoName*/ 1) set_data_dev(t8, /*UserInfoName*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { UserInfoName = "" } = $$props;
    	let { showUserForm } = $$props;

    	//variables
    	let todayDate = new Date();

    	let months = [
    		"January",
    		"February",
    		"March",
    		"April",
    		"May",
    		"June",
    		"July",
    		"August",
    		"September",
    		"October",
    		"November",
    		"December"
    	];

    	const writable_props = ["UserInfoName", "showUserForm"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Greeting> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("UserInfoName" in $$props) $$invalidate(0, UserInfoName = $$props.UserInfoName);
    		if ("showUserForm" in $$props) $$invalidate(1, showUserForm = $$props.showUserForm);
    	};

    	$$self.$capture_state = () => {
    		return {
    			UserInfoName,
    			showUserForm,
    			todayDate,
    			months
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("UserInfoName" in $$props) $$invalidate(0, UserInfoName = $$props.UserInfoName);
    		if ("showUserForm" in $$props) $$invalidate(1, showUserForm = $$props.showUserForm);
    		if ("todayDate" in $$props) $$invalidate(2, todayDate = $$props.todayDate);
    		if ("months" in $$props) $$invalidate(3, months = $$props.months);
    	};

    	return [UserInfoName, showUserForm, todayDate, months];
    }

    class Greeting extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, { UserInfoName: 0, showUserForm: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Greeting",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*showUserForm*/ ctx[1] === undefined && !("showUserForm" in props)) {
    			console.warn("<Greeting> was created without expected prop 'showUserForm'");
    		}
    	}

    	get UserInfoName() {
    		throw new Error("<Greeting>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set UserInfoName(value) {
    		throw new Error("<Greeting>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showUserForm() {
    		throw new Error("<Greeting>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showUserForm(value) {
    		throw new Error("<Greeting>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src/Expense.svelte generated by Svelte v3.18.2 */
    const file$5 = "src/Expense.svelte";

    // (45:4) {#if displayAmount}
    function create_if_block$1(ctx) {
    	let h40;
    	let t0;
    	let t1_value = /*amount*/ ctx[2].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "";
    	let t1;
    	let h40_transition;
    	let t2;
    	let h41;
    	let t3;
    	let t4;
    	let h41_transition;
    	let t5;
    	let h42;
    	let t6;
    	let t7;
    	let h42_transition;
    	let current;

    	const block = {
    		c: function create() {
    			h40 = element("h4");
    			t0 = text("amount: $");
    			t1 = text(t1_value);
    			t2 = space();
    			h41 = element("h4");
    			t3 = text("due date: ");
    			t4 = text(/*date*/ ctx[3]);
    			t5 = space();
    			h42 = element("h4");
    			t6 = text("notes: ");
    			t7 = text(/*notes*/ ctx[4]);
    			add_location(h40, file$5, 45, 6, 993);
    			add_location(h41, file$5, 48, 6, 1108);
    			add_location(h42, file$5, 49, 6, 1157);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h40, anchor);
    			append_dev(h40, t0);
    			append_dev(h40, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, h41, anchor);
    			append_dev(h41, t3);
    			append_dev(h41, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h42, anchor);
    			append_dev(h42, t6);
    			append_dev(h42, t7);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*amount*/ 4) && t1_value !== (t1_value = /*amount*/ ctx[2].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "")) set_data_dev(t1, t1_value);
    			if (!current || dirty & /*date*/ 8) set_data_dev(t4, /*date*/ ctx[3]);
    			if (!current || dirty & /*notes*/ 16) set_data_dev(t7, /*notes*/ ctx[4]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!h40_transition) h40_transition = create_bidirectional_transition(h40, slide, {}, true);
    				h40_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!h41_transition) h41_transition = create_bidirectional_transition(h41, slide, {}, true);
    				h41_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!h42_transition) h42_transition = create_bidirectional_transition(h42, slide, {}, true);
    				h42_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!h40_transition) h40_transition = create_bidirectional_transition(h40, slide, {}, false);
    			h40_transition.run(0);
    			if (!h41_transition) h41_transition = create_bidirectional_transition(h41, slide, {}, false);
    			h41_transition.run(0);
    			if (!h42_transition) h42_transition = create_bidirectional_transition(h42, slide, {}, false);
    			h42_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h40);
    			if (detaching && h40_transition) h40_transition.end();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h41);
    			if (detaching && h41_transition) h41_transition.end();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h42);
    			if (detaching && h42_transition) h42_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(45:4) {#if displayAmount}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let article;
    	let div0;
    	let h2;
    	let t0;
    	let t1;
    	let button0;
    	let i0;
    	let t2;
    	let t3;
    	let div1;
    	let button1;
    	let i1;
    	let t4;
    	let button2;
    	let i2;
    	let current;
    	let dispose;
    	let if_block = /*displayAmount*/ ctx[5] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			article = element("article");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text(/*itemName*/ ctx[1]);
    			t1 = space();
    			button0 = element("button");
    			i0 = element("i");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			div1 = element("div");
    			button1 = element("button");
    			i1 = element("i");
    			t4 = space();
    			button2 = element("button");
    			i2 = element("i");
    			attr_dev(i0, "class", "fas fa-caret-down");
    			add_location(i0, file$5, 41, 8, 905);
    			attr_dev(button0, "class", "amount-btn svelte-1i5ctxr");
    			add_location(button0, file$5, 40, 6, 838);
    			attr_dev(h2, "class", "svelte-1i5ctxr");
    			add_location(h2, file$5, 38, 4, 810);
    			attr_dev(div0, "class", "expense-info");
    			add_location(div0, file$5, 37, 2, 779);
    			attr_dev(i1, "class", "fas fa-pen");
    			add_location(i1, file$5, 56, 6, 1349);
    			attr_dev(button1, "class", "expense-btn edit-btn svelte-1i5ctxr");
    			add_location(button1, file$5, 53, 4, 1253);
    			attr_dev(i2, "class", "fas fa-trash");
    			add_location(i2, file$5, 59, 6, 1473);
    			attr_dev(button2, "class", "expense-btn delete-btn svelte-1i5ctxr");
    			add_location(button2, file$5, 58, 4, 1392);
    			attr_dev(div1, "class", "expense-buttons");
    			add_location(div1, file$5, 52, 2, 1219);
    			attr_dev(article, "class", "single-expense");
    			add_location(article, file$5, 36, 0, 744);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, button0);
    			append_dev(button0, i0);
    			append_dev(div0, t2);
    			if (if_block) if_block.m(div0, null);
    			append_dev(article, t3);
    			append_dev(article, div1);
    			append_dev(div1, button1);
    			append_dev(button1, i1);
    			append_dev(div1, t4);
    			append_dev(div1, button2);
    			append_dev(button2, i2);
    			current = true;

    			dispose = [
    				listen_dev(button0, "click", /*toggleAmountDisplay*/ ctx[6], false, false, false),
    				listen_dev(button1, "click", /*click_handler*/ ctx[9], false, false, false),
    				listen_dev(button2, "click", /*click_handler_1*/ ctx[10], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*itemName*/ 2) set_data_dev(t0, /*itemName*/ ctx[1]);

    			if (/*displayAmount*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { itemName = "Misc" } = $$props;
    	let { amount = 0 } = $$props;
    	let { date = null } = $$props;
    	let { notes = "" } = $$props;

    	//variables
    	let displayAmount = false;

    	//funtions
    	const toggleAmountDisplay = () => $$invalidate(5, displayAmount = !displayAmount);

    	//context
    	const removeExpense = getContext("remove");

    	const setModifiedExpense = getContext("modify");
    	const writable_props = ["id", "itemName", "amount", "date", "notes"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Expense> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => setModifiedExpense(id);
    	const click_handler_1 = () => removeExpense(id);

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("itemName" in $$props) $$invalidate(1, itemName = $$props.itemName);
    		if ("amount" in $$props) $$invalidate(2, amount = $$props.amount);
    		if ("date" in $$props) $$invalidate(3, date = $$props.date);
    		if ("notes" in $$props) $$invalidate(4, notes = $$props.notes);
    	};

    	$$self.$capture_state = () => {
    		return {
    			id,
    			itemName,
    			amount,
    			date,
    			notes,
    			displayAmount
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("itemName" in $$props) $$invalidate(1, itemName = $$props.itemName);
    		if ("amount" in $$props) $$invalidate(2, amount = $$props.amount);
    		if ("date" in $$props) $$invalidate(3, date = $$props.date);
    		if ("notes" in $$props) $$invalidate(4, notes = $$props.notes);
    		if ("displayAmount" in $$props) $$invalidate(5, displayAmount = $$props.displayAmount);
    	};

    	return [
    		id,
    		itemName,
    		amount,
    		date,
    		notes,
    		displayAmount,
    		toggleAmountDisplay,
    		removeExpense,
    		setModifiedExpense,
    		click_handler,
    		click_handler_1
    	];
    }

    class Expense extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$5, safe_not_equal, {
    			id: 0,
    			itemName: 1,
    			amount: 2,
    			date: 3,
    			notes: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Expense",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<Expense> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<Expense>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Expense>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemName() {
    		throw new Error("<Expense>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemName(value) {
    		throw new Error("<Expense>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<Expense>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<Expense>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<Expense>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Expense>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notes() {
    		throw new Error("<Expense>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notes(value) {
    		throw new Error("<Expense>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ExpensesList.svelte generated by Svelte v3.18.2 */
    const file$6 = "src/ExpensesList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (49:4) {:else}
    function create_else_block$1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Currently you have no expenses!";
    			attr_dev(h2, "class", "svelte-lcqga7");
    			add_location(h2, file$6, 49, 6, 1056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(49:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (42:4) {#each expenses as expense, index (expense.id)}
    function create_each_block(key_1, ctx) {
    	let li;
    	let t;
    	let li_intro;
    	let li_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;
    	const expense_spread_levels = [/*expense*/ ctx[2]];
    	let expense_props = {};

    	for (let i = 0; i < expense_spread_levels.length; i += 1) {
    		expense_props = assign(expense_props, expense_spread_levels[i]);
    	}

    	const expense = new Expense({ props: expense_props, $$inline: true });

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			create_component(expense.$$.fragment);
    			t = space();
    			add_location(li, file$6, 42, 6, 889);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(expense, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const expense_changes = (dirty & /*expenses*/ 2)
    			? get_spread_update(expense_spread_levels, [get_spread_object(/*expense*/ ctx[2])])
    			: {};

    			expense.$set(expense_changes);
    		},
    		r: function measure() {
    			rect = li.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(li);
    			stop_animation();
    			add_transform(li, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(li, rect, flip, {});
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expense.$$.fragment, local);

    			add_render_callback(() => {
    				if (li_outro) li_outro.end(1);
    				if (!li_intro) li_intro = create_in_transition(li, fly, { x: 200, delay: /*index*/ ctx[4] * 100 });
    				li_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expense.$$.fragment, local);
    			if (li_intro) li_intro.invalidate();
    			li_outro = create_out_transition(li, fly, { x: -200 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(expense);
    			if (detaching && li_outro) li_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(42:4) {#each expenses as expense, index (expense.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section;
    	let div;
    	let t0;
    	let button;
    	let i;
    	let t1;
    	let t2;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let dispose;

    	const sectionheader = new SectionHeader_1({
    			props: { SectionHeader: "expense list" },
    			$$inline: true
    		});

    	let each_value = /*expenses*/ ctx[1];
    	const get_key = ctx => /*expense*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$1(ctx);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			create_component(sectionheader.$$.fragment);
    			t0 = space();
    			button = element("button");
    			i = element("i");
    			t1 = text("\n      Add a New Expense");
    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(i, "class", "far fa-plus-square");
    			add_location(i, file$6, 36, 6, 744);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn-primary svelte-lcqga7");
    			add_location(button, file$6, 35, 4, 675);
    			attr_dev(div, "class", "header-row svelte-lcqga7");
    			add_location(div, file$6, 33, 2, 595);
    			add_location(ul, file$6, 40, 2, 826);
    			attr_dev(section, "class", "svelte-lcqga7");
    			add_location(section, file$6, 32, 0, 583);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			mount_component(sectionheader, div, null);
    			append_dev(div, t0);
    			append_dev(div, button);
    			append_dev(button, i);
    			append_dev(button, t1);
    			append_dev(section, t2);
    			append_dev(section, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(ul, null);
    			}

    			current = true;

    			dispose = listen_dev(
    				button,
    				"click",
    				function () {
    					if (is_function(/*showForm*/ ctx[0])) /*showForm*/ ctx[0].apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const each_value = /*expenses*/ ctx[1];
    			group_outros();
    			for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    			validate_each_keys(ctx, each_value, get_each_context, get_key);
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, fix_and_outro_and_destroy_block, create_each_block, null, get_each_context);
    			for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    			check_outros();

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block$1(ctx);
    				each_1_else.c();
    				each_1_else.m(ul, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheader.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheader.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionheader);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (each_1_else) each_1_else.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { showForm } = $$props;
    	let { expenses = [] } = $$props;
    	const writable_props = ["showForm", "expenses"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExpensesList> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("showForm" in $$props) $$invalidate(0, showForm = $$props.showForm);
    		if ("expenses" in $$props) $$invalidate(1, expenses = $$props.expenses);
    	};

    	$$self.$capture_state = () => {
    		return { showForm, expenses };
    	};

    	$$self.$inject_state = $$props => {
    		if ("showForm" in $$props) $$invalidate(0, showForm = $$props.showForm);
    		if ("expenses" in $$props) $$invalidate(1, expenses = $$props.expenses);
    	};

    	return [showForm, expenses];
    }

    class ExpensesList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, { showForm: 0, expenses: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpensesList",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*showForm*/ ctx[0] === undefined && !("showForm" in props)) {
    			console.warn("<ExpensesList> was created without expected prop 'showForm'");
    		}
    	}

    	get showForm() {
    		throw new Error("<ExpensesList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showForm(value) {
    		throw new Error("<ExpensesList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expenses() {
    		throw new Error("<ExpensesList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expenses(value) {
    		throw new Error("<ExpensesList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Totals.svelte generated by Svelte v3.18.2 */

    const file$7 = "src/Totals.svelte";

    function create_fragment$7(ctx) {
    	let section;
    	let h2;
    	let t0;
    	let t1;
    	let span;
    	let t2;
    	let t3_value = /*total*/ ctx[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "";
    	let t3;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			t0 = text(/*SectionHeader*/ ctx[0]);
    			t1 = text(":\n    ");
    			span = element("span");
    			t2 = text("$");
    			t3 = text(t3_value);
    			attr_dev(span, "class", "svelte-1161hmq");
    			add_location(span, file$7, 18, 4, 260);
    			add_location(h2, file$7, 16, 2, 230);
    			attr_dev(section, "class", "main-title svelte-1161hmq");
    			add_location(section, file$7, 15, 0, 199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, span);
    			append_dev(span, t2);
    			append_dev(span, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*SectionHeader*/ 1) set_data_dev(t0, /*SectionHeader*/ ctx[0]);
    			if (dirty & /*total*/ 2 && t3_value !== (t3_value = /*total*/ ctx[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "")) set_data_dev(t3, t3_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { SectionHeader = "Section Header" } = $$props;
    	let { total = 0 } = $$props;
    	const writable_props = ["SectionHeader", "total"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Totals> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("SectionHeader" in $$props) $$invalidate(0, SectionHeader = $$props.SectionHeader);
    		if ("total" in $$props) $$invalidate(1, total = $$props.total);
    	};

    	$$self.$capture_state = () => {
    		return { SectionHeader, total };
    	};

    	$$self.$inject_state = $$props => {
    		if ("SectionHeader" in $$props) $$invalidate(0, SectionHeader = $$props.SectionHeader);
    		if ("total" in $$props) $$invalidate(1, total = $$props.total);
    	};

    	return [SectionHeader, total];
    }

    class Totals extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, { SectionHeader: 0, total: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Totals",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get SectionHeader() {
    		throw new Error("<Totals>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set SectionHeader(value) {
    		throw new Error("<Totals>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get total() {
    		throw new Error("<Totals>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set total(value) {
    		throw new Error("<Totals>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ExpenseForm.svelte generated by Svelte v3.18.2 */
    const file$8 = "src/ExpenseForm.svelte";

    // (60:4) {#if isEmpty}
    function create_if_block_1$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "*Please fill out required fields";
    			attr_dev(p, "class", "form-empty");
    			add_location(p, file$8, 60, 6, 1503);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(60:4) {#if isEmpty}",
    		ctx
    	});

    	return block;
    }

    // (69:35) {:else}
    function create_else_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add expense");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(69:35) {:else}",
    		ctx
    	});

    	return block;
    }

    // (69:6) {#if isEditing}
    function create_if_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update expense");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(69:6) {#if isEditing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let t0;
    	let form;
    	let div0;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let div1;
    	let label1;
    	let t5;
    	let input1;
    	let input1_updating = false;
    	let t6;
    	let div2;
    	let label2;
    	let t8;
    	let input2;
    	let t9;
    	let div3;
    	let label3;
    	let t11;
    	let textarea;
    	let t12;
    	let t13;
    	let button0;
    	let t14;
    	let button1;
    	let i;
    	let t15;
    	let current;
    	let dispose;

    	const sectionheader = new SectionHeader_1({
    			props: { SectionHeader: "add expense" },
    			$$inline: true
    		});

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[11].call(input1);
    	}

    	let if_block0 = /*isEmpty*/ ctx[6] && create_if_block_1$1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*isEditing*/ ctx[4]) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(sectionheader.$$.fragment);
    			t0 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Expense name*";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Expense Ammount*";
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Expense Due Date";
    			t8 = space();
    			input2 = element("input");
    			t9 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Expense Notes";
    			t11 = space();
    			textarea = element("textarea");
    			t12 = space();
    			if (if_block0) if_block0.c();
    			t13 = space();
    			button0 = element("button");
    			if_block1.c();
    			t14 = space();
    			button1 = element("button");
    			i = element("i");
    			t15 = text("\n      close");
    			attr_dev(label0, "for", "name");
    			add_location(label0, file$8, 43, 6, 896);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "name");
    			add_location(input0, file$8, 44, 6, 942);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$8, 42, 4, 863);
    			attr_dev(label1, "for", "amount");
    			add_location(label1, file$8, 47, 6, 1044);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "id", "amount");
    			add_location(input1, file$8, 48, 6, 1095);
    			attr_dev(div1, "class", "form-control");
    			add_location(div1, file$8, 46, 4, 1011);
    			attr_dev(label2, "for", "date");
    			add_location(label2, file$8, 51, 6, 1199);
    			attr_dev(input2, "type", "date");
    			attr_dev(input2, "id", "date");
    			add_location(input2, file$8, 52, 6, 1248);
    			attr_dev(div2, "class", "form-control");
    			add_location(div2, file$8, 50, 4, 1166);
    			attr_dev(label3, "for", "notes");
    			add_location(label3, file$8, 55, 6, 1346);
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "col", "100");
    			attr_dev(textarea, "id", "notes");
    			attr_dev(textarea, "class", "svelte-1fvj4fs");
    			add_location(textarea, file$8, 56, 6, 1393);
    			attr_dev(div3, "class", "form-control");
    			add_location(div3, file$8, 54, 4, 1313);
    			attr_dev(button0, "type", "submit");
    			attr_dev(button0, "class", "btn btn-block btn-primary");
    			button0.disabled = /*isEmpty*/ ctx[6];
    			toggle_class(button0, "disabled", /*isEmpty*/ ctx[6]);
    			add_location(button0, file$8, 62, 4, 1576);
    			attr_dev(i, "class", "fas fa-times");
    			add_location(i, file$8, 71, 6, 1846);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "close-btn");
    			add_location(button1, file$8, 70, 4, 1779);
    			attr_dev(form, "action", "");
    			attr_dev(form, "class", "expense-form");
    			add_location(form, file$8, 41, 2, 781);
    			attr_dev(section, "class", "form");
    			add_location(section, file$8, 39, 0, 708);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(sectionheader, section, null);
    			append_dev(section, t0);
    			append_dev(section, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t2);
    			append_dev(div0, input0);
    			set_input_value(input0, /*itemName*/ ctx[0]);
    			append_dev(form, t3);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t5);
    			append_dev(div1, input1);
    			set_input_value(input1, /*amount*/ ctx[1]);
    			append_dev(form, t6);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t8);
    			append_dev(div2, input2);
    			set_input_value(input2, /*date*/ ctx[2]);
    			append_dev(form, t9);
    			append_dev(form, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t11);
    			append_dev(div3, textarea);
    			set_input_value(textarea, /*notes*/ ctx[3]);
    			append_dev(form, t12);
    			if (if_block0) if_block0.m(form, null);
    			append_dev(form, t13);
    			append_dev(form, button0);
    			if_block1.m(button0, null);
    			append_dev(form, t14);
    			append_dev(form, button1);
    			append_dev(button1, i);
    			append_dev(button1, t15);
    			current = true;

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[12]),
    				listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[13]),
    				listen_dev(
    					button1,
    					"click",
    					function () {
    						if (is_function(/*hideForm*/ ctx[5])) /*hideForm*/ ctx[5].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[7]), false, true, false)
    			];
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*itemName*/ 1 && input0.value !== /*itemName*/ ctx[0]) {
    				set_input_value(input0, /*itemName*/ ctx[0]);
    			}

    			if (!input1_updating && dirty & /*amount*/ 2) {
    				set_input_value(input1, /*amount*/ ctx[1]);
    			}

    			input1_updating = false;

    			if (dirty & /*date*/ 4) {
    				set_input_value(input2, /*date*/ ctx[2]);
    			}

    			if (dirty & /*notes*/ 8) {
    				set_input_value(textarea, /*notes*/ ctx[3]);
    			}

    			if (/*isEmpty*/ ctx[6]) {
    				if (!if_block0) {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(form, t13);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(button0, null);
    				}
    			}

    			if (!current || dirty & /*isEmpty*/ 64) {
    				prop_dev(button0, "disabled", /*isEmpty*/ ctx[6]);
    			}

    			if (dirty & /*isEmpty*/ 64) {
    				toggle_class(button0, "disabled", /*isEmpty*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectionheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectionheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(sectionheader);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { addExpense } = $$props;
    	let { itemName = "" } = $$props;
    	let { amount = null } = $$props;
    	let { date = null } = $$props;
    	let { notes = "" } = $$props;
    	let { isEditing } = $$props;
    	let { editExpense } = $$props;
    	let { hideForm } = $$props;

    	//variables
    	//functions
    	const handleSubmit = e => {
    		if (isEditing) {
    			editExpense({ itemName, amount, date, notes });
    		} else {
    			addExpense({ itemName, amount, date, notes });
    		}

    		$$invalidate(0, itemName = "");
    		$$invalidate(1, amount = null);
    		$$invalidate(2, date = null);
    		$$invalidate(3, notes = "");
    		hideForm();
    	};

    	const writable_props = [
    		"addExpense",
    		"itemName",
    		"amount",
    		"date",
    		"notes",
    		"isEditing",
    		"editExpense",
    		"hideForm"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExpenseForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		itemName = this.value;
    		$$invalidate(0, itemName);
    	}

    	function input1_input_handler() {
    		amount = to_number(this.value);
    		$$invalidate(1, amount);
    	}

    	function input2_input_handler() {
    		date = this.value;
    		$$invalidate(2, date);
    	}

    	function textarea_input_handler() {
    		notes = this.value;
    		$$invalidate(3, notes);
    	}

    	$$self.$set = $$props => {
    		if ("addExpense" in $$props) $$invalidate(8, addExpense = $$props.addExpense);
    		if ("itemName" in $$props) $$invalidate(0, itemName = $$props.itemName);
    		if ("amount" in $$props) $$invalidate(1, amount = $$props.amount);
    		if ("date" in $$props) $$invalidate(2, date = $$props.date);
    		if ("notes" in $$props) $$invalidate(3, notes = $$props.notes);
    		if ("isEditing" in $$props) $$invalidate(4, isEditing = $$props.isEditing);
    		if ("editExpense" in $$props) $$invalidate(9, editExpense = $$props.editExpense);
    		if ("hideForm" in $$props) $$invalidate(5, hideForm = $$props.hideForm);
    	};

    	$$self.$capture_state = () => {
    		return {
    			addExpense,
    			itemName,
    			amount,
    			date,
    			notes,
    			isEditing,
    			editExpense,
    			hideForm,
    			isEmpty
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("addExpense" in $$props) $$invalidate(8, addExpense = $$props.addExpense);
    		if ("itemName" in $$props) $$invalidate(0, itemName = $$props.itemName);
    		if ("amount" in $$props) $$invalidate(1, amount = $$props.amount);
    		if ("date" in $$props) $$invalidate(2, date = $$props.date);
    		if ("notes" in $$props) $$invalidate(3, notes = $$props.notes);
    		if ("isEditing" in $$props) $$invalidate(4, isEditing = $$props.isEditing);
    		if ("editExpense" in $$props) $$invalidate(9, editExpense = $$props.editExpense);
    		if ("hideForm" in $$props) $$invalidate(5, hideForm = $$props.hideForm);
    		if ("isEmpty" in $$props) $$invalidate(6, isEmpty = $$props.isEmpty);
    	};

    	let isEmpty;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*itemName, amount*/ 3) {
    			//reactivity
    			 $$invalidate(6, isEmpty = !itemName || !amount);
    		}
    	};

    	return [
    		itemName,
    		amount,
    		date,
    		notes,
    		isEditing,
    		hideForm,
    		isEmpty,
    		handleSubmit,
    		addExpense,
    		editExpense,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		textarea_input_handler
    	];
    }

    class ExpenseForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$8, safe_not_equal, {
    			addExpense: 8,
    			itemName: 0,
    			amount: 1,
    			date: 2,
    			notes: 3,
    			isEditing: 4,
    			editExpense: 9,
    			hideForm: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpenseForm",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*addExpense*/ ctx[8] === undefined && !("addExpense" in props)) {
    			console.warn("<ExpenseForm> was created without expected prop 'addExpense'");
    		}

    		if (/*isEditing*/ ctx[4] === undefined && !("isEditing" in props)) {
    			console.warn("<ExpenseForm> was created without expected prop 'isEditing'");
    		}

    		if (/*editExpense*/ ctx[9] === undefined && !("editExpense" in props)) {
    			console.warn("<ExpenseForm> was created without expected prop 'editExpense'");
    		}

    		if (/*hideForm*/ ctx[5] === undefined && !("hideForm" in props)) {
    			console.warn("<ExpenseForm> was created without expected prop 'hideForm'");
    		}
    	}

    	get addExpense() {
    		throw new Error("<ExpenseForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addExpense(value) {
    		throw new Error("<ExpenseForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemName() {
    		throw new Error("<ExpenseForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemName(value) {
    		throw new Error("<ExpenseForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<ExpenseForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<ExpenseForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<ExpenseForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<ExpenseForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notes() {
    		throw new Error("<ExpenseForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notes(value) {
    		throw new Error("<ExpenseForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isEditing() {
    		throw new Error("<ExpenseForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isEditing(value) {
    		throw new Error("<ExpenseForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get editExpense() {
    		throw new Error("<ExpenseForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editExpense(value) {
    		throw new Error("<ExpenseForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideForm() {
    		throw new Error("<ExpenseForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideForm(value) {
    		throw new Error("<ExpenseForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Modal.svelte generated by Svelte v3.18.2 */
    const file$9 = "src/Modal.svelte";

    function create_fragment$9(ctx) {
    	let div1;
    	let div0;
    	let div0_transition;
    	let div1_intro;
    	let div1_outro;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "modal-content");
    			add_location(div0, file$9, 5, 2, 124);
    			attr_dev(div1, "class", "modal-container");
    			add_location(div1, file$9, 4, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 1) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fly, { y: 200 }, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, blur, {});
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fly, { y: 200 }, false);
    			div0_transition.run(0);
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [$$scope, $$slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.18.2 */
    const file$a = "src/App.svelte";

    // (128:2) {#if UserForm}
    function create_if_block_1$2(ctx) {
    	let current;

    	const usermodal = new UserModal({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(usermodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(usermodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const usermodal_changes = {};

    			if (dirty & /*$$scope, isEditing*/ 4194816) {
    				usermodal_changes.$$scope = { dirty, ctx };
    			}

    			usermodal.$set(usermodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(usermodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(usermodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(usermodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(128:2) {#if UserForm}",
    		ctx
    	});

    	return block;
    }

    // (129:4) <UserModal>
    function create_default_slot_1(ctx) {
    	let current;

    	const usernameform = new UserNameForm({
    			props: {
    				addUserInfo: /*addUserInfo*/ ctx[17],
    				isEditing: /*isEditing*/ ctx[9],
    				hideUserForm: /*hideUserForm*/ ctx[11]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(usernameform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(usernameform, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const usernameform_changes = {};
    			if (dirty & /*isEditing*/ 512) usernameform_changes.isEditing = /*isEditing*/ ctx[9];
    			usernameform.$set(usernameform_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(usernameform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(usernameform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(usernameform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(129:4) <UserModal>",
    		ctx
    	});

    	return block;
    }

    // (133:2) {#if isFormOpen}
    function create_if_block$3(ctx) {
    	let current;

    	const modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, setItemName, setAmount, setDate, setNotes, isEditing*/ 4194876) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(133:2) {#if isFormOpen}",
    		ctx
    	});

    	return block;
    }

    // (134:4) <Modal>
    function create_default_slot(ctx) {
    	let current;

    	const expenseform = new ExpenseForm({
    			props: {
    				addExpense: /*addExpense*/ ctx[15],
    				itemName: /*setItemName*/ ctx[2],
    				amount: /*setAmount*/ ctx[3],
    				date: /*setDate*/ ctx[4],
    				notes: /*setNotes*/ ctx[5],
    				isEditing: /*isEditing*/ ctx[9],
    				editExpense: /*editExpense*/ ctx[16],
    				hideForm: /*hideForm*/ ctx[13]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(expenseform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(expenseform, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const expenseform_changes = {};
    			if (dirty & /*setItemName*/ 4) expenseform_changes.itemName = /*setItemName*/ ctx[2];
    			if (dirty & /*setAmount*/ 8) expenseform_changes.amount = /*setAmount*/ ctx[3];
    			if (dirty & /*setDate*/ 16) expenseform_changes.date = /*setDate*/ ctx[4];
    			if (dirty & /*setNotes*/ 32) expenseform_changes.notes = /*setNotes*/ ctx[5];
    			if (dirty & /*isEditing*/ 512) expenseform_changes.isEditing = /*isEditing*/ ctx[9];
    			expenseform.$set(expenseform_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expenseform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expenseform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(expenseform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(134:4) <Modal>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t0;
    	let main;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let button;
    	let current;
    	let dispose;
    	const navbar = new Navbar({ $$inline: true });
    	let if_block0 = /*UserForm*/ ctx[7] && create_if_block_1$2(ctx);
    	let if_block1 = /*isFormOpen*/ ctx[6] && create_if_block$3(ctx);

    	const greeting = new Greeting({
    			props: {
    				UserInfoName: /*UserInfoName*/ ctx[1],
    				showUserForm: /*showUserForm*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const totals = new Totals({
    			props: {
    				SectionHeader: "total expenses",
    				total: /*total*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const expenseslist = new ExpensesList({
    			props: {
    				expenses: /*expenses*/ ctx[0],
    				showForm: /*showForm*/ ctx[12]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			create_component(greeting.$$.fragment);
    			t3 = space();
    			create_component(totals.$$.fragment);
    			t4 = space();
    			create_component(expenseslist.$$.fragment);
    			t5 = space();
    			button = element("button");
    			button.textContent = "Clear expenses";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary btn-block");
    			add_location(button, file$a, 148, 2, 3706);
    			attr_dev(main, "class", "content svelte-1vsba7f");
    			add_location(main, file$a, 126, 0, 3159);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t1);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t2);
    			mount_component(greeting, main, null);
    			append_dev(main, t3);
    			mount_component(totals, main, null);
    			append_dev(main, t4);
    			mount_component(expenseslist, main, null);
    			append_dev(main, t5);
    			append_dev(main, button);
    			current = true;
    			dispose = listen_dev(button, "click", /*clearExpenses*/ ctx[14], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*UserForm*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*isFormOpen*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const greeting_changes = {};
    			if (dirty & /*UserInfoName*/ 2) greeting_changes.UserInfoName = /*UserInfoName*/ ctx[1];
    			greeting.$set(greeting_changes);
    			const totals_changes = {};
    			if (dirty & /*total*/ 256) totals_changes.total = /*total*/ ctx[8];
    			totals.$set(totals_changes);
    			const expenseslist_changes = {};
    			if (dirty & /*expenses*/ 1) expenseslist_changes.expenses = /*expenses*/ ctx[0];
    			expenseslist.$set(expenseslist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(greeting.$$.fragment, local);
    			transition_in(totals.$$.fragment, local);
    			transition_in(expenseslist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(greeting.$$.fragment, local);
    			transition_out(totals.$$.fragment, local);
    			transition_out(expenseslist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(greeting);
    			destroy_component(totals);
    			destroy_component(expenseslist);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	const setLocalStorage = () => {
    		localStorage.setItem("expenses", JSON.stringify(expenses));
    		localStorage.setItem("UserInfoName", JSON.stringify(UserInfoName));
    	};

    	onMount(() => {
    		$$invalidate(0, expenses = localStorage.getItem("expenses")
    		? JSON.parse(localStorage.getItem("expenses"))
    		: []);

    		$$invalidate(1, UserInfoName = localStorage.getItem("UserInfoName")
    		? JSON.parse(localStorage.getItem("UserInfoName"))
    		: "");

    		$$invalidate(7, UserForm = localStorage.getItem("UserInfoName") ? false : true);
    	});

    	afterUpdate(() => {
    		setLocalStorage();
    	});

    	//variables
    	let expenses = [];

    	let UserInfoName = "";
    	let setItemName = "";
    	let setAmount = null;
    	let setDate = null;
    	let setNotes = "";
    	let setId = null;
    	let isFormOpen = false;
    	let UserForm = false;

    	//functions
    	const showUserForm = () => $$invalidate(7, UserForm = true);

    	const hideUserForm = () => {
    		$$invalidate(7, UserForm = false);
    	};

    	const showForm = () => $$invalidate(6, isFormOpen = true);

    	const hideForm = () => {
    		$$invalidate(6, isFormOpen = false);
    		$$invalidate(18, setId = null);
    		$$invalidate(3, setAmount = null);
    		$$invalidate(2, setItemName = "");
    		$$invalidate(4, setDate = null);
    		$$invalidate(5, setNotes = "");
    	};

    	const removeExpense = id => {
    		$$invalidate(0, expenses = expenses.filter(listItem => listItem.id !== id));
    	};

    	const clearExpenses = () => {
    		const confirmDelete = confirm("Are you sure you would like to delete your Expense List?");

    		if (confirmDelete) {
    			$$invalidate(0, expenses = []);
    		} else {
    			return;
    		}
    	};

    	const addExpense = ({ itemName, amount, date, notes }) => {
    		let expense = {
    			id: Math.random() * Date.now(),
    			itemName,
    			amount,
    			date,
    			notes
    		};

    		$$invalidate(0, expenses = [...expenses, expense]);
    	};

    	const setModifiedExpense = id => {
    		let expense = expenses.find(listItem => listItem.id === id);
    		$$invalidate(18, setId = expense.id);
    		$$invalidate(2, setItemName = expense.itemName);
    		$$invalidate(3, setAmount = expense.amount);
    		$$invalidate(4, setDate = expense.date);
    		$$invalidate(5, setNotes = expense.notes);
    		showForm();
    	};

    	const editExpense = ({ itemName, amount, date, notes }) => {
    		$$invalidate(0, expenses = expenses.map(listItem => {
    			return listItem.id === setId
    			? {
    					...listItem,
    					itemName,
    					amount,
    					date,
    					notes
    				}
    			: { ...listItem };
    		}));

    		$$invalidate(18, setId = null);
    		$$invalidate(3, setAmount = null);
    		$$invalidate(2, setItemName = "");
    		$$invalidate(4, setDate = null);
    		$$invalidate(5, setNotes = "");
    	};

    	const addUserInfo = ({ userName, email }) => {
    		$$invalidate(1, UserInfoName = userName);
    	};

    	//context
    	setContext("remove", removeExpense);

    	setContext("modify", setModifiedExpense);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("expenses" in $$props) $$invalidate(0, expenses = $$props.expenses);
    		if ("UserInfoName" in $$props) $$invalidate(1, UserInfoName = $$props.UserInfoName);
    		if ("setItemName" in $$props) $$invalidate(2, setItemName = $$props.setItemName);
    		if ("setAmount" in $$props) $$invalidate(3, setAmount = $$props.setAmount);
    		if ("setDate" in $$props) $$invalidate(4, setDate = $$props.setDate);
    		if ("setNotes" in $$props) $$invalidate(5, setNotes = $$props.setNotes);
    		if ("setId" in $$props) $$invalidate(18, setId = $$props.setId);
    		if ("isFormOpen" in $$props) $$invalidate(6, isFormOpen = $$props.isFormOpen);
    		if ("UserForm" in $$props) $$invalidate(7, UserForm = $$props.UserForm);
    		if ("total" in $$props) $$invalidate(8, total = $$props.total);
    		if ("isEditing" in $$props) $$invalidate(9, isEditing = $$props.isEditing);
    	};

    	let total;
    	let isEditing;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*expenses*/ 1) {
    			//reactivity
    			 $$invalidate(8, total = expenses.reduce(
    				(acc, curr) => {
    					return acc += curr.amount;
    				},
    				0
    			));
    		}

    		if ($$self.$$.dirty & /*setId*/ 262144) {
    			 $$invalidate(9, isEditing = setId ? true : false);
    		}
    	};

    	return [
    		expenses,
    		UserInfoName,
    		setItemName,
    		setAmount,
    		setDate,
    		setNotes,
    		isFormOpen,
    		UserForm,
    		total,
    		isEditing,
    		showUserForm,
    		hideUserForm,
    		showForm,
    		hideForm,
    		clearExpenses,
    		addExpense,
    		editExpense,
    		addUserInfo
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
