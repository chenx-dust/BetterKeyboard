let Oe = class extends C.Component {
    static {
        te = this
    } static contextType = E.E3;
    static s_keyCapTypeData = {
        [V.dI.Character]: [W().KeyboardCharacterKey, W().KeyboardCharacterKeySize, !0],
        [V.dI.Half]: [W().KeyboardHalfKey, W().KeyboardHalfKeySize, !0],
        [V.dI.Tab]: [W().KeyboardTabKey, W().KeyboardTabKeySize, !0],
        [V.dI.Meta]: [W().KeyboardMetaKey, W().KeyboardMetaKeySize, !0],
        [V.dI.Close]: [W().KeyboardCharacterKey, W().KeyboardMetaKeySize, !0],
        [V.dI.Caps]: [W().KeyboardCapsKey, W().KeyboardCapsKeySize, !0],
        [V.dI.Backspace]: [W().KeyboardBackspace, W().KeyboardBackspaceSize, !0],
        [V.dI.Enter]: [W().KeyboardEnter, W().KeyboardEnterSize, !0],
        [V.dI.LeftShift]: [W().KeyboardLeftShift, W().KeyboardLeftShiftSize, !0],
        [V.dI.RightShift]: [W().KeyboardRightShift, W().KeyboardRightShiftSize, !0],
        [V.dI.Spacebar]: [W().KeyboardSpacebar, W().KeyboardSpacebarSize, !0],
        [V.dI.Spacer25]: [W().KeyboardSpacer, W().KeyboardSpacerSize, !1]
    };
    static s_keyToggleData = {
        Shift: "Shift",
        CapsLock: "CapsLock",
        Control: "Control",
        Alt: "Alt",
        AltGr: "AltGr"
    };
    static s_rgNumericLayout = [["7", "8", "9"], ["4", "5", "6"], ["1", "2", "3"], ["0", ".", {
        key: "Backspace",
        label: "#Key_Backspace",
        type: V.dI.Backspace,
        centerLeftActionButton: T.g4.X
    }]];
    static s_rgCombinedSteamAndEmojiRowHeader = [{
        key: "SwitchKeys_RecentSteamItems",
        label: D.ClockOutline,
        type: V.dI.Character,
        emojiCategoryIndex: 9,
        bSteamItemCategory: !0,
        strLocDescription: "#Emoji_RecentSteamItems"
    }, {
        key: "SwitchKeys_Emoticons",
        label: () => C.createElement(k.ZT, null),
        type: V.dI.Character,
        emojiCategoryIndex: 10,
        bSteamItemCategory: !0,
        strLocDescription: "#Emoji_Emoticons"
    }, {
        key: "SwitchKeys_Stickers",
        label: () => C.createElement(k.qm, null),
        type: V.dI.Character,
        emojiCategoryIndex: 11,
        bSteamItemCategory: !0,
        strLocDescription: "#Emoji_Stickers"
    }, {
        key: "SwitchKeys_ChatFX",
        label: () => C.createElement(k.Mj, null),
        type: V.dI.Character,
        emojiCategoryIndex: 12,
        bSteamItemCategory: !0,
        strLocDescription: "#Emoji_ChatFX"
    }, {
        key: "",
        label: "",
        type: V.dI.Spacer25
    }, Ie, Me, Ee, Re, Te, ke, De, Ne, Fe];
    static s_rgEmojiRowHeader = [Ie, Me, Ee, Re, Te, ke, De, Ne, Fe];
    static s_rgSteamItemsBottomRow = e => [{
        key: "SwitchKeys_ABC",
        label: "ABC",
        type: V.dI.Meta
    }, V.fF, V.jP, V.WG, e.Arrows ? [V.Md, V.GO] : void 0, e.Arrows ? [V.B6, V.xl] : void 0, [e.DoneInsteadOfHide ? V.gg : V.k6, e.AllowMove ? V.zi : void 0]];
    static s_rgSteamItemCategories = ["RecentSteamItems", "Emoticons", "Stickers", "ChatFX"];
    m_emojiCategories;
    InitEmojiCategories(e) {
        if (this.m_emojiCategories)
            return;
        this.m_emojiCategories = [];
        let t = [];
        t.push(e.FullEmojiList.findIndex((e => "😀" === e.key))),
            t.push(e.FullEmojiList.findIndex((e => "💆" === e.key))),
            t.push(e.FullEmojiList.findIndex((e => "🐵" === e.key))),
            t.push(e.FullEmojiList.findIndex((e => "🍇" === e.key))),
            t.push(e.FullEmojiList.findIndex((e => "🌍" === e.key))),
            t.push(e.FullEmojiList.findIndex((e => "👓" === e.key))),
            t.push(e.FullEmojiList.findIndex((e => "💋" === e.key))),
            t.push(e.FullEmojiList.findIndex((e => "🏁" === e.key)));
        const r = ["People", "Activity", "Animals", "Food", "Travel", "Objects", "Symbols", "Flags"];
        this.m_emojiCategories.push({
            key: "Recent",
            startIndex: 0,
            startColumn: 0,
            categoryIndex: 0
        });
        let n = Math.ceil(e.GetMaxRecentEmoji() / te.s_numEmojiRows);
        for (let e = 0; e < t.length; e++)
            this.m_emojiCategories.push({
                key: r[e],
                startIndex: t[e],
                startColumn: n,
                categoryIndex: e + 1
            }),
                e < t.length - 1 && (n += Math.ceil((t[e + 1] - t[e]) / te.s_numEmojiRows))
    }
    WithEmojiStore(e) {
        (() => {
            this.InitEmojiCategories(d._),
                e(d._)
        }
        )()
    }
    static s_rgExtendedKeys = {
        a: "áàâãäåæāą",
        c: "ćçč",
        e: "éèêëēėę",
        i: "íìîïįī",
        l: "ł",
        n: "ńñ",
        o: "óòôõöøōœ",
        s: "śßš",
        u: "úùûüū",
        y: "ÿ",
        z: "źžż",
        0: "°",
        "-": "–—·",
        "=": "≈≠",
        ".": "…",
        "!": "¡",
        "?": "¿",
        "'": "‘’",
        '"': "“”„»«",
        $: "¢€£¥₱₩",
        "%": "‰",
        "&": "§"
    };
    static s_initialFocusRow = 2;
    static s_initialFocusColumn = 5;
    static s_numEmojiRows = 3;
    static s_EmojiKeyWidth = 58;
    static s_longPressThreshold = 450;
    static s_longPressRepeatThreshold = 200;
    m_keyboardDiv = null;
    m_keyboardNavRef = C.createRef();
    m_emojiHeaderMapRefs = new Map;
    m_emojiScrollRef = C.createRef();
    m_resizeObserver;
    m_trackpadInput = new S.E;
    m_leftTrackpad = {
        active: !1,
        x: 0,
        y: 0,
        lastElement: void 0
    };
    m_rightTrackpad = {
        active: !1,
        x: 0,
        y: 0,
        lastElement: void 0
    };
    m_nBackspaceTimer = null;
    m_nLongPressTimer = null;
    m_mapTouched = new Set;
    constructor(e) {
        super(e),
            this.state = {
                toggleStates: {
                    Shift: ce.Off,
                    CapsLock: ce.Off,
                    Control: ce.Off,
                    Alt: ce.Off,
                    AltGr: ce.Off
                },
                rgLayoutTouchCount: [],
                nExtendedKeyTouched: -1,
                layoutState: me.Layout_Standard,
                standardLayout: (0,
                    V.r_)(),
                curEmojiCategoryIndex: 0,
                bIsInMultitouch: !1,
                watchdogTimer: null,
                holdTarget: null,
                holdSource: v.Vz.UNKNOWN,
                longPressRow: null,
                longPressCol: null,
                keyDown: {
                    key: null,
                    keyRow: -1,
                    keyCol: -1
                },
                bLeftTrackpadActive: !1,
                bRightTrackpadActive: !1,
                bLeftTrackpadDown: !1,
                bRightTrackpadDown: !1,
                bLongPressSentKey: !1,
                bShowLayoutName: !1,
                screenReaderElement: ""
            }
    }
    AnnounceToScreenReader(e) {
        e != this.state.screenReaderElement && (ne.Debug("Announcing", e),
            this.setState({
                screenReaderElement: e
            }))
    }
    m_timerShowLayoutName;
    SetLayoutNameTimeout() {
        this.m_timerShowLayoutName && clearTimeout(this.m_timerShowLayoutName),
            this.m_timerShowLayoutName = window.setTimeout((() => {
                this.m_timerShowLayoutName = 0,
                    this.setState({
                        bShowLayoutName: !1
                    })
            }
            ), 2e3)
    }
    OnLayoutChanged(e) {
        setTimeout((() => this.props.VirtualKeyboardManager.RestoreVirtualKeyboardForLastActiveElement()), 1),
            this.SetLayoutNameTimeout(),
            this.AnnounceToScreenReader((0,
                L.we)((0,
                    V.r_)().locToken)),
            this.setState({
                standardLayout: (0,
                    V.r_)(),
                bShowLayoutName: !0
            })
    }
    TypeKey(e) {
        for (let t = e; null != t && t !== this.m_keyboardDiv; t = t.parentElement) {
            const e = {
                strKey: t.getAttribute("data-key"),
                strKeycode: t.getAttribute("data-keycode"),
                strIsLiteral: t.getAttribute("data-key-is-literal"),
                strKeyHandler: t.getAttribute("data-key-handler"),
                strEmojiIndex: t.getAttribute("data-emoji-index"),
                strEmojiTint: t.getAttribute("data-emoji-tint"),
                strShifted: t.getAttribute("data-key-shifted"),
                strDeadKeyNext: t.getAttribute("data-dead-key-next"),
                strDeadKeyCombined: t.getAttribute("data-dead-key-combined")
            };
            if (null != e.strKey)
                return this.TypeKeyInternal(e)
        }
    }
    TypeKeyInternal(e) {
        let { strKey: t, strKeycode: r, strIsLiteral: i, strKeyHandler: a, strEmojiIndex: s, strEmojiTint: o, strShifted: l, strDeadKeyNext: c, strDeadKeyCombined: m } = e;
        const u = te.s_keyToggleData[t];
        if (u)
            "CapsLock" === u ? this.setState(((e, t) => ({
                ...e,
                toggleStates: {
                    ...e.toggleStates,
                    [u]: ue(e.toggleStates[u])
                }
            }))) : this.setState(((e, t) => ({
                ...e,
                toggleStates: {
                    ...e.toggleStates,
                    [u]: de(e.toggleStates[u])
                }
            })));
        else {
            if (t.startsWith("SwitchKeys_"))
                if (t.endsWith("ABC"))
                    this.setState({
                        layoutState: me.Layout_Standard
                    });
                else if (t.endsWith("123"))
                    this.setState({
                        layoutState: me.Layout_Numeric
                    });
                else if (t.endsWith("Steam"))
                    this.WithEmojiStore((e => {
                        if (this.props.bStandalone) {
                            let e = 0;
                            this.setState({
                                layoutState: me.Layout_Emoji,
                                curEmojiCategoryIndex: e
                            })
                        } else {
                            let e = te.s_rgSteamItemCategories.indexOf("RecentSteamItems") + this.m_emojiCategories.length;
                            this.setState({
                                layoutState: me.Layout_SteamItems,
                                curEmojiCategoryIndex: e
                            })
                        }
                    }
                    ));
                else if (t.endsWith("Layout"))
                    (0,
                        V.gM)(this.OnLayoutChanged);
                else if (t.endsWith("Emoji"))
                    this.setState({
                        layoutState: me.Layout_Emoji
                    });
                else {
                    const e = t.replace("SwitchKeys_", "");
                    let r = te.s_rgSteamItemCategories.indexOf(e);
                    this.WithEmojiStore((t => {
                        if (-1 != r)
                            r += this.m_emojiCategories.length,
                                this.setState({
                                    layoutState: me.Layout_SteamItems,
                                    curEmojiCategoryIndex: r
                                });
                        else {
                            const t = this.m_emojiCategories.find((({ key: t }) => t === e));
                            void 0 !== t && (this.OnSelectEmojiCategory(t),
                                this.setState({
                                    layoutState: me.Layout_Emoji,
                                    curEmojiCategoryIndex: t.categoryIndex
                                }))
                        }
                    }
                    ))
                }
            else if (t.startsWith("IME_"))
                t.endsWith("LUT_Down") ? this.context && this.context.process_key_event(n.Page_Down, 0, 0) : t.endsWith("LUT_Up") ? this.context && this.context.process_key_event(n.Page_Up, 0, 0) : t.startsWith("IME_LUT_Select_") && (0,
                    E.CB)(this.context, this.state.standardLayout.layout, parseInt(t.substring(15)));
            else {
                const e = parseInt(s);
                if (this.state.layoutState === me.Layout_Emoji && !isNaN(e) && (d._.AddRecentEmoji(e),
                    null !== o)) {
                    let t = parseInt(o);
                    d._.AddEmojiTint(e, t)
                }
                if (1 !== t.length || !Ae(this.state.toggleStates.Shift) && !Ae(this.state.toggleStates.CapsLock) || l || (t = ge(t)),
                    a)
                    this.HandleSpecialBehaviorForKey(t, a);
                else if (c)
                    this.props.VirtualKeyboardManager.HandleDeadKeyDown(t, c, m);
                else if ("VKMove" === t)
                    this.RotateWindowPosition();
                else if (1 != t.length && "Backspace" !== t && "Enter" !== t && "Tab" !== t)
                    this.props.VirtualKeyboardManager.HandleVirtualKeyDown(t, Ae(this.state.toggleStates.Shift));
                else if (i || this.state.layoutState === me.Layout_Emoji)
                    this.context && this.context.reset(),
                        this.props.VirtualKeyboardManager.HandleVirtualKeyDown(t, Ae(this.state.toggleStates.Shift));
                else {
                    const e = async (e, t) => {
                        let i = !1;
                        if (this.context) {
                            let a;
                            switch (e) {
                                case "Backspace":
                                    a = n.BackSpace;
                                    break;
                                case "Tab":
                                    a = n.Tab;
                                    break;
                                case "Enter":
                                    a = n.Return;
                                    break;
                                default:
                                    a = e.charCodeAt(0)
                            }
                            const s = parseFloat(r) || 0
                                , o = t ? IBus.ModifierType.SHIFT_MASK : 0;
                            i = !!await this.context.process_key_event(a, s, o)
                        }
                        i || this.props.VirtualKeyboardManager.HandleVirtualKeyDown(e, t)
                    }
                        ;
                    e(t, Ae(this.state.toggleStates.Shift))
                }
            }
            this.setState(((e, t) => ({
                ...e,
                toggleStates: {
                    ...e.toggleStates,
                    Shift: pe(e.toggleStates.Shift),
                    Control: pe(e.toggleStates.Control),
                    Alt: pe(e.toggleStates.Alt),
                    AltGr: pe(e.toggleStates.AltGr)
                }
            })))
        }
    }
    OnForwardKeyEvent(e, t, r) {
        const i = 0 != (r & IBus.ModifierType.SHIFT_MASK);
        let a;
        switch (e) {
            case n.BackSpace:
                a = "Backspace";
                break;
            case n.Tab:
                a = "Tab";
                break;
            case n.Return:
                a = "Enter";
                break;
            default:
                a = String.fromCharCode(e)
        }
        this.props.VirtualKeyboardManager.HandleVirtualKeyDown(a, i)
    }
    OnDeleteSurroundingText(e, t) {
        if (e == -t)
            for (let e = 0; e < t; ++e)
                this.props.VirtualKeyboardManager.HandleVirtualKeyDown("Backspace", !1)
    }
    OnCommitText(e) {
        e = e.replace(/./g, (e => ie[e] || e)),
            this.props.VirtualKeyboardManager.HandleVirtualKeyDown(e, !1)
    }
    OnActiveElementChangedOrClicked(e) {
        this.context && this.context.reset()
    }
    HandleSpecialBehaviorForKey(e, t) {
        switch (t) {
            case "emoticon":
                this.props.VirtualKeyboardManager.HandleVirtualKeyDown(`:${e}:`, Ae(this.state.toggleStates.Shift));
                break;
            case "sticker":
                l.LN.TrackStickerUsage(e, Date.now() / 1e3),
                    this.props.VirtualKeyboardManager.HandleVirtualKeyDown(`/sticker ${e}\r`, Ae(this.state.toggleStates.Shift));
                break;
            case "roomeffect":
                this.props.VirtualKeyboardManager.HandleVirtualKeyDown(`/roomeffect ${e}\r`, Ae(this.state.toggleStates.Shift))
        }
    }
    KeyDown(e) {
        const { target: t } = e;
        if ((0,
            P.kD)(t)) {
            R.eZ.PlayNavSound(R.PN.Typing, !0);
            const r = parseFloat(t.getAttribute("data-key-row"))
                , n = parseFloat(t.getAttribute("data-key-col"))
                , i = {
                    key: t.getAttribute("data-key"),
                    keyRow: r,
                    keyCol: n
                };
            this.setState({
                keyDown: i
            });
            const a = "clientX" in e
                , s = t.hasAttribute("data-extended-chars")
                , o = parseFloat(t.getAttribute("data-emoji-index"))
                , l = t.hasAttribute("data-emoji-index") && 0 != d._.FullEmojiList[o].nNumTints;
            if (this.state.holdTarget && (this.TypeKey(this.state.holdTarget),
                this.CancelLongPressTimer(),
                this.DismissLongPress(),
                this.ClearHoldTarget()),
                s || l || a) {
                let r = e;
                this.StartLongPressTimer(t, a ? v.Vz.MOUSE : r.detail.source),
                    t.addEventListener("mouseleave", this.OnKeyMouseLeave)
            } else
                this.TypeKey(t);
            e.stopPropagation(),
                e.preventDefault()
        }
    }
    KeyUp(e) {
        const { target: t } = e;
        if ((0,
            P.kD)(t)) {
            const r = {
                key: null,
                keyRow: -1,
                keyCol: -1
            };
            this.setState({
                keyDown: r
            });
            const n = t.hasAttribute("parent-row") ? parseFloat(t.getAttribute("parent-row") || "") : null
                , i = t.hasAttribute("parent-col") ? parseFloat(t.getAttribute("parent-col") || "") : null;
            let a = null !== n && null !== i && this.state.longPressRow === n && this.state.longPressCol === i;
            this.state.bLongPressSentKey || (t === this.state.holdTarget || a ? this.TypeKey(t) : this.TypeKey(this.state.holdTarget),
                e.stopPropagation(),
                e.preventDefault())
        }
        this.CancelLongPressTimer(),
            this.DismissLongPress(),
            this.ClearHoldTarget()
    }
    OnMouseDown(e) {
        this.KeyDown(e)
    }
    OnMouseUp(e) {
        this.KeyUp(e)
    }
    OnSelectEmojiCategory(e) {
        let t = d._.GetRecentEmoji()
            , r = "Recent" != e.key ? Math.ceil(t.length / te.s_numEmojiRows) : 0
            , n = "Recent" != e.key ? Math.ceil(d._.GetMaxRecentEmoji() / te.s_numEmojiRows) : 0
            , i = (e.startColumn - n + r) * te.s_EmojiKeyWidth;
        if (this.m_emojiScrollRef.current) {
            this.m_emojiScrollRef.current.firstChild.scrollLeft = i
        }
    }
    OnSelectSiblingEmojiCategory(e) {
        this.WithEmojiStore((t => {
            const r = this.m_emojiCategories.length
                , n = te.s_rgSteamItemCategories.length;
            let i, a = this.state.curEmojiCategoryIndex;
            switch (a += e,
            this.state.layoutState) {
                case me.Layout_SteamItems:
                    {
                        let e = a - r;
                        if (e >= 0)
                            if (e >= n) {
                                a = 0;
                                let e = this.m_emojiCategories[a];
                                this.setState({
                                    layoutState: me.Layout_Emoji,
                                    curEmojiCategoryIndex: a
                                }),
                                    this.OnSelectEmojiCategory(e),
                                    i = e.key
                            } else
                                this.setState({
                                    layoutState: me.Layout_SteamItems,
                                    curEmojiCategoryIndex: a
                                }),
                                    i = te.s_rgSteamItemCategories[e]
                    }
                    break;
                case me.Layout_Emoji:
                    if (a < 0 && !this.props.bStandalone)
                        a = r + n - 1,
                            this.setState({
                                layoutState: me.Layout_SteamItems,
                                curEmojiCategoryIndex: a
                            }),
                            i = te.s_rgSteamItemCategories[n - 1];
                    else if (a < r && a >= 0) {
                        let e = this.m_emojiCategories[a];
                        this.setState({
                            layoutState: me.Layout_Emoji,
                            curEmojiCategoryIndex: a
                        }),
                            this.OnSelectEmojiCategory(e),
                            i = e.key
                    }
            }
            let s = i ? this.m_emojiHeaderMapRefs.get("SwitchKeys_" + i) : void 0;
            s && s.current && s.current.TakeFocus()
        }
        ))
    }
    HandleTrackpadClick(e, t) {
        let r = null
            , n = v.Vz.UNKNOWN;
        switch (e) {
            case v.pR.LPAD_CLICK:
            case v.pR.TRIGGER_LEFT:
                r = this.getElementFromPointWorkaround(this.m_leftTrackpad.x, this.m_leftTrackpad.y),
                    this.setState({
                        bLeftTrackpadDown: t
                    }),
                    n = v.Vz.LPAD,
                    this.OnTrackpadHover(this.m_leftTrackpad.lastElement, r);
                break;
            case v.pR.RPAD_CLICK:
            case v.pR.TRIGGER_RIGHT:
                r = this.getElementFromPointWorkaround(this.m_rightTrackpad.x, this.m_rightTrackpad.y),
                    this.setState({
                        bRightTrackpadDown: t
                    }),
                    n = v.Vz.RPAD,
                    this.OnTrackpadHover(this.m_rightTrackpad.lastElement, r)
        }
        r && (0,
            B.AE)(r, t ? "vgp_onbuttondown" : "vgp_onbuttonup", {
                button: v.pR.OK,
                source: n,
                is_repeat: !1
            })
    }
    OnGamepadButtonDown(e) {
        switch (e.detail.button) {
            case v.pR.OK:
                this.KeyDown(e);
                break;
            case v.pR.OPTIONS:
                this.DispatchEventByDataKey(" ", !0);
                break;
            case v.pR.LPAD_CLICK:
                this.HandleTrackpadClick(e.detail.button, !0);
                break;
            case v.pR.TRIGGER_LEFT:
                this.m_leftTrackpad.active && u.O.TrackpadTypingTriggerAsClick ? this.HandleTrackpadClick(e.detail.button, !0) : this.setState(((e, t) => ({
                    ...e,
                    toggleStates: {
                        ...e.toggleStates,
                        Shift: ce.Stuck
                    }
                })));
                break;
            case v.pR.RPAD_CLICK:
                this.HandleTrackpadClick(e.detail.button, !0);
                break;
            case v.pR.TRIGGER_RIGHT:
                this.m_rightTrackpad.active && u.O.TrackpadTypingTriggerAsClick ? this.HandleTrackpadClick(e.detail.button, !0) : this.DispatchEventByDataKey("Enter", !0);
                break;
            case v.pR.SECONDARY:
                if (e.detail.source == v.Vz.KEYBOARD_SIMULATOR)
                    return;
                this.DispatchEventByDataKey("Backspace", !0),
                    this.StartBackspaceTimer();
                break;
            case v.pR.DIR_UP:
            case v.pR.DIR_DOWN:
            case v.pR.DIR_LEFT:
            case v.pR.DIR_RIGHT:
                break;
            case v.pR.BUMPER_LEFT:
                this.TypeKeyInternal({
                    strKey: "IME_LUT_Up"
                }),
                    this.OnSelectSiblingEmojiCategory(-1);
                break;
            case v.pR.BUMPER_RIGHT:
                this.TypeKeyInternal({
                    strKey: "IME_LUT_Down"
                }),
                    this.OnSelectSiblingEmojiCategory(1);
                break;
            case v.pR.START:
                this.RotateWindowPosition()
        }
    }
    OnGamepadButtonUp(e) {
        switch (e.detail.button) {
            case v.pR.OK:
                this.KeyUp(e);
                break;
            case v.pR.RPAD_CLICK:
                this.HandleTrackpadClick(e.detail.button, !1);
                break;
            case v.pR.TRIGGER_RIGHT:
                this.state.bRightTrackpadDown && u.O.TrackpadTypingTriggerAsClick ? this.HandleTrackpadClick(e.detail.button, !1) : this.DispatchEventByDataKey("Enter", !1);
                break;
            case v.pR.LPAD_CLICK:
                this.HandleTrackpadClick(e.detail.button, !1);
                break;
            case v.pR.TRIGGER_LEFT:
                this.state.bLeftTrackpadDown && u.O.TrackpadTypingTriggerAsClick ? this.HandleTrackpadClick(e.detail.button, !1) : this.setState(((e, t) => ({
                    ...e,
                    toggleStates: {
                        ...e.toggleStates,
                        Shift: ce.Off
                    }
                })));
                break;
            case v.pR.LSTICK_CLICK:
                this.setState(((e, t) => ({
                    ...e,
                    toggleStates: {
                        ...e.toggleStates,
                        CapsLock: ue(e.toggleStates.CapsLock)
                    }
                })));
                break;
            case v.pR.SECONDARY:
                this.DispatchEventByDataKey("Backspace", !1),
                    this.CancelBackpaceTimer(),
                    this.DismissBackpaceTimer();
                break;
            case v.pR.OPTIONS:
                this.DispatchEventByDataKey(" ", !1)
        }
    }
    DispatchEventByDataKey(e, t) {
        const r = this.m_keyboardDiv?.ownerDocument.defaultView ?? this.props.windowInstance.BrowserWindow;
        let n = r?.document.querySelector('[data-key="' + e + '"]');
        return !!n && ((0,
            B.AE)(n, t ? "vgp_onbuttondown" : "vgp_onbuttonup", {
                button: v.pR.OK,
                source: v.Vz.GAMEPAD,
                is_repeat: !1
            }),
            !0)
    }
    HandleNavOut() {
        return this.props.VirtualKeyboardManager.HandleNavOut(this.props.windowInstance.BrowserWindow),
            !0
    }
    LongPressTimerExpired() {
        if (this.state.holdTarget) {
            const e = this.state.holdTarget
                , t = parseFloat(e.getAttribute("data-key-row") || "")
                , r = parseFloat(e.getAttribute("data-key-col") || "")
                , n = "Backspace" == e.getAttribute("data-key");
            this.setState({
                longPressRow: t,
                longPressCol: r,
                bLongPressSentKey: n
            }),
                n || this.m_keyboardNavRef.current.PushState(),
                n ? (this.StartLongPressTimer(this.state.holdTarget, this.state.holdSource, !0),
                    this.TypeKey(e)) : this.CancelLongPressTimer()
        }
    }
    DismissLongPress() {
        const e = (this.state.longPressRow || this.state.longPressCol) && !this.state.bLongPressSentKey;
        this.setState({
            longPressRow: null,
            longPressCol: null,
            bLongPressSentKey: !1
        }, e ? () => this.m_keyboardNavRef.current.PopState() : null)
    }
    StartLongPressTimer(e, t, r = !1) {
        const n = this.m_nLongPressTimer;
        n && window.clearTimeout(n);
        const i = window.setTimeout((() => {
            this.LongPressTimerExpired()
        }
        ), r ? te.s_longPressRepeatThreshold : te.s_longPressThreshold);
        this.m_nLongPressTimer = i,
            this.setState({
                holdTarget: e,
                holdSource: t
            })
    }
    StartBackspaceTimer(e = !1) {
        const t = this.m_nBackspaceTimer;
        t && window.clearTimeout(t);
        const r = window.setTimeout((() => {
            this.BackspaceTimeExpired()
        }
        ), e ? te.s_longPressRepeatThreshold : te.s_longPressThreshold);
        this.m_nBackspaceTimer = r
    }
    BackspaceTimeExpired() {
        this.StartBackspaceTimer(!0),
            this.TypeKeyInternal({
                strKey: "Backspace"
            }),
            this.setState({
                bLongPressSentKey: !0
            })
    }
    DismissBackpaceTimer() {
        this.setState({
            bLongPressSentKey: !1
        })
    }
    CancelBackpaceTimer() {
        const e = this.m_nBackspaceTimer;
        e && clearTimeout(e),
            this.setState({
                bLongPressSentKey: !1
            }),
            this.m_nBackspaceTimer = null
    }
    OnKeyMouseLeave(e) {
        this.CancelLongPressTimer(),
            this.ClearHoldTarget()
    }
    ClearHoldTarget() {
        this.state.holdTarget && this.state.holdTarget.removeEventListener("mouseleave", this.OnKeyMouseLeave),
            this.setState({
                holdTarget: null,
                holdSource: v.Vz.UNKNOWN
            })
    }
    CancelLongPressTimer() {
        this.m_nLongPressTimer && clearTimeout(this.m_nLongPressTimer),
            this.m_nLongPressTimer = null
    }
    ToggleStatesUpdate(e, t, r) {
        const n = {};
        for (const i in e) {
            const a = i
                , s = e[a]
                , o = t && t[a] || !1;
            n[a] = o ? s | ce.Held : s & ce.Held ? r ? ce.Off : "CapsLock" === a ? ue(s) : de(s) : s
        }
        return n
    }
    UpdateTouchState(e, t) {
        let r = 0
            , n = []
            , i = -1
            , a = null;
        for (let s = 0; s < t.length; ++s) {
            const o = t[s]
                , l = o.target;
            if ((0,
                P.kD)(l)) {
                const t = parseFloat(l.getAttribute("data-key-row") || "")
                    , s = parseFloat(l.getAttribute("data-key-col") || "");
                if (null !== this.state.longPressRow && null !== this.state.longPressCol) {
                    const t = e.elementFromPoint(o.clientX, o.clientY)
                        , r = t?.hasAttribute("parent-row") ? parseFloat(t?.getAttribute("parent-row") || "") : null
                        , n = t?.hasAttribute("parent-col") ? parseFloat(t?.getAttribute("parent-col") || "") : null;
                    if (null !== r && null !== n) {
                        const e = parseFloat(t?.getAttribute("data-key-col") || "");
                        i = e
                    }
                }
                void 0 === n[t] && (n[t] = []),
                    n[t][s] || (n[t][s] = 0),
                    ++n[t][s],
                    ++r;
                const c = l.getAttribute("data-key");
                if (null == c)
                    continue;
                const m = te.s_keyToggleData[c];
                m ? (null === a && (a = {}),
                    a[m] = !0) : this.m_mapTouched.has(l) && null === this.state.longPressRow && null === this.state.longPressCol && this.StartLongPressTimer(l, v.Vz.TOUCH)
            }
        }
        this.setState(((e, t) => ({
            ...e,
            rgLayoutTouchCount: n,
            nExtendedKeyTouched: i,
            toggleStates: this.ToggleStatesUpdate(e.toggleStates, a, e.bIsInMultitouch),
            bIsInMultitouch: 0 !== r && (1 !== r || e.bIsInMultitouch)
        })))
    }
    HandleTouchStart(e) {
        if (!(0,
            P.kD)(e.target))
            return;
        const t = e.target.ownerDocument;
        if (!t)
            return;
        const r = u.O.HapticSettings;
        m.l.PlaySteamDeckHaptic(2, r.eHapticType, r.unIntensity, r.ndBGain),
            this.state.holdTarget && (this.CancelLongPressTimer(),
                this.DismissLongPress(),
                this.ClearHoldTarget(),
                this.m_mapTouched.delete(this.state.holdTarget));
        for (let t = 0; t < e.changedTouches.length; ++t) {
            const r = e.changedTouches[t].target;
            (0,
                P.kD)(r) && this.m_mapTouched.add(r)
        }
        H.TS.ON_DECK || R.eZ.PlayNavSound(R.PN.Typing, !0),
            this.UpdateTouchState(t, e.touches)
    }
    HandleTouchMove(e) {
        if (null !== this.state.longPressRow && null !== this.state.longPressCol) {
            if (!(0,
                P.kD)(e.target))
                return;
            const t = e.target.ownerDocument;
            if (!t)
                return;
            this.UpdateTouchState(t, e.touches)
        }
        e.preventDefault(),
            e.stopPropagation()
    }
    IsCharacterFromActiveExtendedMenu(e) {
        const t = e.hasAttribute("parent-row") ? parseFloat(e.getAttribute("parent-row") || "") : null
            , r = e.hasAttribute("parent-col") ? parseFloat(e.getAttribute("parent-col") || "") : null;
        return null !== t && null !== r && this.state.longPressRow === t && this.state.longPressCol === r
    }
    HandleTouchEnd(e) {
        if (!(0,
            P.kD)(e.target))
            return;
        const t = e.target.ownerDocument;
        if (t) {
            for (let r = 0; r < e.changedTouches.length; ++r) {
                const n = e.changedTouches[r]
                    , i = n.target
                    , a = this.ElementFromTouch(t, n);
                if ((0,
                    P.kD)(a) && (0,
                        P.kD)(i)) {
                    const e = this.IsCharacterFromActiveExtendedMenu(a);
                    if (this.m_mapTouched.has(i) || e) {
                        const t = i.getAttribute("data-key");
                        if (null == t)
                            continue;
                        const r = te.s_keyToggleData[t];
                        this.state.bLongPressSentKey || r && this.state.bIsInMultitouch || this.TypeKey(e ? a : i)
                    }
                }
                this.m_mapTouched.delete(i)
            }
            this.CancelLongPressTimer(),
                this.DismissLongPress(),
                this.ClearHoldTarget(),
                this.UpdateTouchState(t, e.touches),
                e.preventDefault(),
                e.stopPropagation()
        }
    }
    HandleTouchCancel(e) {
        e.preventDefault(),
            e.stopPropagation()
    }
    ElementFromTouch(e, t) {
        const r = e.elementsFromPoint(t.clientX, t.clientY);
        let n = r.length > 0 ? r[0] : void 0;
        return "MouseHoverBlockerHack" === n?.id && (n = r.length > 1 ? r[1] : void 0),
            n
    }
    OnEmojiFocus(e) {
        const { target: t } = e;
        if ((0,
            P.kD)(t)) {
            const e = parseInt(t.getAttribute("data-category-index"));
            this.setState({
                curEmojiCategoryIndex: e
            })
        }
    }
    GetEmojiGridProps() {
        const e = te.s_numEmojiRows;
        let t = [];
        for (let r = 0; r < e; ++r)
            t.push([]);
        let r, n = d._.GetRecentEmoji();
        return this.m_emojiCategories.forEach(((r, i) => {
            let a = 0
                , s = "Recent" === r.key;
            const o = i === this.m_emojiCategories.length - 1 ? d._.FullEmojiList.length : this.m_emojiCategories[i + 1].startIndex
                , l = s ? n.length : o;
            for (let i = 0; i < e; ++i) {
                let o = r.startIndex + i
                    , c = 0;
                for (; o < l;) {
                    const l = s ? n[o] : o
                        , m = c + r.startColumn;
                    let u = {
                        index: l,
                        emoji: d._.FullEmojiList[l],
                        category: r,
                        row: i,
                        column: m
                    };
                    t[i].push(u),
                        o += e,
                        c++,
                        a = Math.max(c, a)
                }
                for (; c < a; ++c)
                    t[i].push(void 0)
            }
        }
        )),
            this.state.holdSource == v.Vz.LPAD ? r = C.createElement(Pe, {
                className: W().ExtendedRowTrackpad,
                pressed: this.state.bLeftTrackpadDown,
                input: this.m_trackpadInput,
                trackpad: v.pR.LPAD_TOUCH,
                fnCallback: this.OnLeftTrackpadAnalog
            }) : this.state.holdSource == v.Vz.RPAD && (r = C.createElement(Pe, {
                className: W().ExtendedRowTrackpad,
                pressed: this.state.bRightTrackpadDown,
                input: this.m_trackpadInput,
                trackpad: v.pR.RPAD_TOUCH,
                fnCallback: this.OnRightTrackpadAnalog
            })),
        {
            EmojiStore: d._,
            mapEmoji: t,
            keyDown: this.state.keyDown,
            bAnyTrackpadActive: this.BHasTrackpadHover(),
            rgLayoutTouchCount: this.state.rgLayoutTouchCount,
            longPressRow: this.state.longPressRow,
            longPressCol: this.state.longPressCol,
            nExtendedKeyTouched: this.state.nExtendedKeyTouched,
            holdTarget: this.state.holdTarget,
            holdSourceTouchpad: r,
            onGamepadFocus: this.OnEmojiFocus,
            onKeyFocus: this.OnKeyFocus,
            onKeyHover: this.OnKeyHover
        }
    }
    GetKeyboardThemeClassName() {
        return p.iG.GetKeyboardSkinTheme() ?? "DefaultTheme"
    }
    GetKeyClassNameForTheme(e, t, r) {
        let n = "Col_" + r;
        if (e instanceof Object) {
            let t = e;
            return t.type != V.dI.Spacebar ? n + " KeyTheme_" + t.key : null
        }
        return n + " KeyTheme_" + e
    }
    BHasTrackpadHover() {
        return this.state.bLeftTrackpadActive || this.state.bRightTrackpadActive
    }
    FilterButtonForTrackpad(e) {
        if (!(this.state.bLeftTrackpadActive && e == T.g4.LeftTrigger || this.state.bRightTrackpadActive && e == T.g4.RightTrigger))
            return e
    }
    StopResizeListening() {
        this.m_keyboardDiv && (this.m_resizeObserver.unobserve(this.m_keyboardDiv),
            this.m_keyboardDiv = null,
            this.m_resizeObserver = null)
    }
    SetKeyboardDiv(e) {
        this.StopResizeListening(),
            this.m_keyboardDiv = e,
            this.m_keyboardDiv && (this.m_resizeObserver = new this.m_keyboardDiv.ownerDocument.defaultView.ResizeObserver(this.UpdateWindowSize),
                this.m_resizeObserver.observe(this.m_keyboardDiv))
    }
    UpdateWindowSize() {
        if (this.m_keyboardDiv)
            if (this.props.bStandalone) {
                const e = (0,
                    F.DH)(this.m_keyboardDiv)
                    , t = this.props.windowInstance.BrowserWindow
                    , r = Math.floor(e * this.m_keyboardDiv.offsetWidth)
                    , n = Math.floor(e * this.m_keyboardDiv.offsetHeight);
                t.SteamClient.Window.GetWindowDimensions().then((e => {
                    t && e.height < n && t.SteamClient.Window.ResizeTo(r, n, !0)
                }
                ))
            } else if (this.props.bModal) {
                this.m_keyboardDiv.getBoundingClientRect();
                this.props.VirtualKeyboardManager.SelectBestModalPosition(this.m_keyboardDiv)
            }
    }
    RotateWindowPosition() {
        this.props.VirtualKeyboardManager.RotateKeyboardLocation(this.props.bStandalone, this.props.windowInstance.BrowserWindow)
    }
    BIsKeyEnabled(e) {
        switch (e) {
            case "SwitchKeys_Layout":
                if (1 == u.O.GetKeyboardLayoutSettings().selectedLayouts.length)
                    return !1;
                break;
            case "VKMove":
                return !!this.props.bStandalone || !!this.props.bModal
        }
        return !0
    }
    FilterKeyCapSpec(e) {
        if (e instanceof Array) {
            let t = [null, null, null, null];
            for (let r = 0; r < e.length && r < t.length; ++r) {
                let n = e[r];
                t[r] = this.BIsKeyEnabled(n instanceof Object ? n.key : n) ? n : null
            }
            return t
        }
        return this.BIsKeyEnabled(e instanceof Object ? e.key : e) ? e : null
    }
    BIsVR() {
        return this.props.windowInstance?.IsVRWindow()
    }
    BShowGlyphs() {
        return !this.BIsVR()
    }
    GetLayoutOptions() {
        return this.props
    }
    OnKeyFocus(e, t) {
        t && (ne.Debug("Focused", e, t),
            this.AnnounceToScreenReader(e))
    }
    OnKeyHover(e, t) {
        t && ne.Debug("Hovered", e, t)
    }
    RenderKey(e, t, r, n, i, a, s, o) {
        const { VirtualKeyboardManager: l } = this.props
            , { toggleStates: c, rgLayoutTouchCount: m, nExtendedKeyTouched: u } = this.state
            , d = Ae(this.state.toggleStates.Shift)
            , A = Ae(this.state.toggleStates.CapsLock)
            , p = Ae(this.state.toggleStates.AltGr)
            , g = (!d || !A) && (d || A)
            , h = this.BShowGlyphs();
        if (!(n = this.FilterKeyCapSpec(n)))
            return null;
        const _ = e => e ? e instanceof Object ? e.key : e : ""
            , f = e => "function" == typeof e ? e({}) : "string" == typeof e && "#" !== e && e.startsWith("#") ? (0,
                L.we)(e) : e
            , [y, w, B, S, I] = (e => {
                if (p) {
                    if (e instanceof Array)
                        return e.length > 2 ? e.length > 3 ? d ? [e[3], e[2], null, null, !0] : [e[2], e[3], null, null, !1] : [e[2], null, null, null, !1] : ["", null, null, null, !1];
                    {
                        const t = e instanceof Object ? e.key : e;
                        return t?.length > 1 ? [e, null, null, null, !1] : ["", null, null, null, !1]
                    }
                }
                return e instanceof Array ? d ? [e[1] ? e[1] : e[0], e[1] ? e[0] : e[1], e.length > 3 ? e[3] : null, e.length > 2 ? e[2] : null, !!e[1]] : [e[0], e.length > 1 ? e[1] : null, e.length > 2 ? e[2] : null, e.length > 3 ? e[3] : null, !1] : [e, null, null, null, !1]
            }
            )(n)
            , M = e => null === e ? null : e instanceof Object ? "Enter" === e.key && l.GetEnterKeyLabel() ? f(l.GetEnterKeyLabel()) : g && !I && "string" == typeof e.label && 1 === e.label.length ? f(ge(e.label)) : e.type == V.dI.Spacebar && this.state.bShowLayoutName ? (0,
                L.we)(this.state.standardLayout.locToken) : f(e.label) : e
            , [E, R, T, [k, D, N]] = y instanceof Object ? [y.key, M(y), y.strLocDescription, null != y.type && te.s_keyCapTypeData[y.type] || [void 0, void 0, !0]] : [y, g && !I && 1 === y?.length ? ge(y) : y, void 0, [void 0, void 0, !0]]
            , F = M(w)
            , O = M(B)
            , P = M(S)
            , z = s && i < s / 2;
        let x = null;
        if (1 == E?.length && " " !== E) {
            let e = E;
            y instanceof Object && void 0 !== y.extended_keys && (e = y.extended_keys),
                n instanceof Array && n.length > 1 && (p ? (e += _(n[1]),
                    e += _(n[0])) : (e += _(n[1]),
                        n.length > 2 && (e += _(n[2])),
                        n.length > 3 && (e += _(n[3])))),
                e += te.s_rgExtendedKeys[E] ?? "",
                x = e.split("").filter(((e, t, r) => r.indexOf(e) === t)),
                z || (x = x.reverse())
        }
        const U = y instanceof Object && y.dead ? E == l.GetDeadKeyPending() ? W().KeyboardKeyDeadKeyActive : W().KeyboardKeyDeadKey : void 0
            , H = w instanceof Object && w.dead ? w.key == l.GetDeadKeyPending() ? W().InactiveLabelDeadKeyActive : W().InactiveLabelDeadKey : void 0
            , j = y instanceof Object ? y.dead_next : null
            , q = y instanceof Object ? y.dead_combined : null
            , Q = h && y instanceof Object ? this.FilterButtonForTrackpad(y.leftActionButton) : void 0
            , Z = h && y instanceof Object ? this.FilterButtonForTrackpad(y.centerLeftActionButton) : void 0
            , Y = h && y instanceof Object ? this.FilterButtonForTrackpad(y.rightActionButton) : void 0
            , X = y instanceof Object ? y.emojiCategoryIndex : void 0
            , K = y instanceof Object && X === this.state.curEmojiCategoryIndex ? W().KeyboardCategoryKeyHighlight : void 0
            , J = te.s_keyToggleData[E]
            , $ = J ? c[J] & ce.OneShot ? W().ToggleOneShot : c[J] & (ce.Held | ce.Stuck) ? W().ToggleOn : void 0 : void 0
            , ee = m[e] && m[e][i] > 0 ? W().Touched : void 0
            , re = this.state.keyDown.key == E && E?.length > 0 ? W().Touched : void 0
            , ne = this.state.longPressRow === e && this.state.longPressCol === i
            , ie = e === t && i === r && !ne
            , ae = y instanceof Object && y.is_literal;
        let se;
        void 0 !== X && (se = this.m_emojiHeaderMapRefs.get(E) || (0,
            b.b$)(),
            this.m_emojiHeaderMapRefs.set(E, se));
        const oe = {
            "data-key": E,
            "data-key-row": e,
            "data-key-col": i,
            "data-keycode": a || 0
        };
        x && (oe["data-extended-chars"] = 1),
            I && (oe["data-key-shifted"] = 1),
            j && (oe["data-dead-key-next"] = j),
            q && (oe["data-dead-key-combined"] = q),
            ae && (oe["data-key-is-literal"] = 1);
        let le, me = this.GetKeyClassNameForTheme(y, e, i), ue = (0,
            G.A)(W().KeyboardKey, k, $, ee, re, U, K, me);
        if (null != x && ne) {
            let t;
            this.state.holdSource == v.Vz.LPAD ? t = C.createElement(Pe, {
                className: W().ExtendedRowTrackpad,
                pressed: this.state.bLeftTrackpadDown,
                input: this.m_trackpadInput,
                trackpad: v.pR.LPAD_TOUCH,
                fnCallback: this.OnLeftTrackpadAnalog
            }) : this.state.holdSource == v.Vz.RPAD && (t = C.createElement(Pe, {
                className: W().ExtendedRowTrackpad,
                pressed: this.state.bRightTrackpadDown,
                input: this.m_trackpadInput,
                trackpad: v.pR.RPAD_TOUCH,
                fnCallback: this.OnRightTrackpadAnalog
            })),
                le = C.createElement(Ce, {
                    extendedChars: x,
                    parentRow: e,
                    parentCol: i,
                    bIsUpperCase: g,
                    bExtendRight: z,
                    nExtendedKeyTouched: u,
                    onKeyFocus: this.OnKeyFocus,
                    onKeyHover: this.OnKeyHover
                }, t)
        }
        return C.createElement(Ge, {
            key: `KB.${e}.${i}`,
            nRow: e,
            nKey: i,
            navRef: se,
            bAutoFocus: ie,
            bFocusable: N,
            bIsShift: d,
            bHasTrackpadHover: this.BHasTrackpadHover(),
            dataProps: oe,
            className: D,
            innerClassName: ue,
            leftActionButton: Q,
            centerLeftActionButton: Z,
            rightActionButton: Y,
            label: R,
            strLocDescription: T,
            inactiveLabel: F,
            strInactiveLabelDeadKeyStyle: H,
            altGrLabel: O,
            inactiveAltGrLabel: P,
            extendedKeyRow: le,
            onFocus: this.OnKeyFocus,
            onHover: this.OnKeyHover,
            ariaProps: o
        })
    }
    RenderTabBar(e, t, r, n, i) {
        return C.createElement(w.Z, {
            key: `KB.${r}`,
            role: "tablist",
            className: (0,
                G.A)(W().KeyboardRow, "Row_" + r),
            "flow-children": "row",
            ...M.C3,
            navEntryPreferPosition: I.iU.MAINTAIN_X
        }, e.map(((a, s) => this.RenderKey(r, n, i, a, s, t?.[s] || 0, e.length, {
            role: "tab"
        }))))
    }
    RenderKeyboardRow(e, t, r, n, i) {
        return C.createElement(w.Z, {
            key: `KB.${r}`,
            role: "row",
            "aria-rowindex": r + 1,
            className: (0,
                G.A)(W().KeyboardRow, "Row_" + r),
            "flow-children": "row",
            ...M.C3,
            navEntryPreferPosition: I.iU.MAINTAIN_X
        }, e.map(((a, s) => this.RenderKey(r, n, i, a, s, t?.[s] || 0, e.length))))
    }
    KeyboardPanel(e) {
        const { className: t, children: r, ...n } = e
            , i = this.props.VirtualKeyboardManager
            , a = (0,
                g.q3)((() => this.GetKeyboardThemeClassName()))
            , s = (0,
                g.q3)((() => i.KeyboardLocation));
        return C.createElement(w.Z, {
            ref: this.SetKeyboardDiv,
            navRef: this.m_keyboardNavRef,
            role: "grid",
            "flow-children": "grid",
            autoFocus: !0,
            focusable: !1,
            className: (0,
                G.A)(t, W().Keyboard, a, this.props.bModal && s, this.props.bModal && W().Modal, this.props.bVRFloatingKeyboard && W().VRFloatingKeyboard),
            ...n,
            onTouchStart: this.HandleTouchStart,
            onTouchMove: this.HandleTouchMove,
            onTouchEnd: this.HandleTouchEnd,
            onTouchCancel: this.HandleTouchCancel,
            onMouseDown: this.OnMouseDown,
            onMouseUp: this.OnMouseUp,
            onButtonDown: this.OnGamepadButtonDown,
            onButtonUp: this.OnGamepadButtonUp,
            onMoveUp: this.HandleNavOut
        }, r, C.createElement("div", {
            className: W().AriaLiveRegion,
            "aria-live": "assertive"
        }, this.state.screenReaderElement))
    }
    RenderStandardKeyboard(e) {
        const { name: t, rgLayout: r, rgKeycodes: n } = e
            , i = this.state.holdSource == v.Vz.LPAD && null !== this.state.longPressCol && null !== this.state.longPressRow
            , a = this.state.holdSource == v.Vz.RPAD && null !== this.state.longPressCol && null !== this.state.longPressRow
            , s = "Layout_" + t
            , o = this.BShowGlyphs()
            , l = this.GetLayoutOptions();
        return C.createElement(this.KeyboardPanel, {
            className: (0,
                G.A)(W().Keyboard, s),
            scrollIntoViewWhenChildFocused: !0
        }, C.createElement(oe, {
            layout: e.layout,
            bHasTrackpadHover: this.BHasTrackpadHover(),
            rgLayoutTouchCount: this.state.rgLayoutTouchCount,
            bShowGlyphs: o
        }), C.createElement(ae, {
            onCommitText: this.OnCommitText,
            onForwardKeyEvent: this.OnForwardKeyEvent,
            onDeleteSurroundingText: this.OnDeleteSurroundingText
        }), C.createElement(le, {
            VirtualKeyboardManager: this.props.VirtualKeyboardManager,
            onActiveElementChanged: this.OnActiveElementChangedOrClicked,
            onActiveElementClicked: this.OnActiveElementChangedOrClicked
        }), C.createElement(se, {
            layout: e.layout
        }), r(l).map(((e, t) => this.RenderKeyboardRow(e, n?.[t], t, te.s_initialFocusRow, te.s_initialFocusColumn))), !i && C.createElement(Pe, {
            className: W().LeftTrackpad,
            pressed: this.state.bLeftTrackpadDown,
            input: this.m_trackpadInput,
            trackpad: v.pR.LPAD_TOUCH,
            fnCallback: this.OnLeftTrackpadAnalog
        }), !a && C.createElement(Pe, {
            className: W().RightTrackpad,
            pressed: this.state.bRightTrackpadDown,
            input: this.m_trackpadInput,
            trackpad: v.pR.RPAD_TOUCH,
            fnCallback: this.OnRightTrackpadAnalog
        }), C.createElement(Le, {
            keyboard: this.m_keyboardDiv,
            fnCallback: this.OnRightTrackpadAnalog
        }))
    }
    OnTrackpadHover(e, t) {
        if (e != t) {
            if (e) {
                e.classList.remove(W().Focused);
                let t = e.firstElementChild;
                t && t.classList.remove(W().Focused)
            }
            if (t) {
                t.classList.add(W().Focused);
                let e = t.firstElementChild;
                e && e.classList.add(W().Focused)
            }
        }
    }
    getElementFromPointWorkaround(e, t) {
        const r = this.m_keyboardDiv?.ownerDocument.defaultView ?? this.props.windowInstance.BrowserWindow;
        if (c.oy.WindowStore.BHasStandaloneConfiguratorWindow() || c.oy.WindowStore.BHasStandaloneKeyboard()) {
            const r = (0,
                F.DH)(this.m_keyboardDiv);
            e *= r,
                t *= r
        }
        let n = r.document.elementFromPoint(e, t);
        return n && (n.getAttribute("data-key") || (n = void 0)),
            n
    }
    OnTrackpadAnalogInternal(e, t, r, n, i, a) {
        if (e.active = r,
            e.x = n,
            e.y = i,
            r) {
            let s = e.lastElement ? e.lastElementBoundingRect : void 0;
            if (!s || !(s.x <= n && n <= s.x + s.width && s.y <= i && i <= s.y + s.height)) {
                let s = this.getElementFromPointWorkaround(n, i);
                s != e.lastElement && (this.OnTrackpadHover(e.lastElement, s),
                    e.lastElement = s,
                    e.lastElementBoundingRect = s?.getBoundingClientRect(),
                    m.l.PlayHaptic(a, t, m.n.Tick, 1, 0),
                    this.m_keyboardDiv?.ownerDocument.defaultView.SteamClient?.OpenVR?.TriggerOverlayHapticEffect(r ? N.en.ButtonEnter : N.en.ButtonLeave, a))
            }
        } else
            this.OnTrackpadHover(e.lastElement, void 0),
                e.lastElement = void 0
    }
    OnLeftTrackpadAnalog(e, t, r, n) {
        this.OnTrackpadAnalogInternal(this.m_leftTrackpad, 0, e, t, r, n),
            this.state.bLeftTrackpadActive != e && this.setState({
                bLeftTrackpadActive: e
            })
    }
    OnRightTrackpadAnalog(e, t, r, n) {
        this.OnTrackpadAnalogInternal(this.m_rightTrackpad, 1, e, t, r, n),
            this.state.bRightTrackpadActive != e && this.setState({
                bRightTrackpadActive: e
            })
    }
    RenderNumericKeyboard() {
        const e = {
            key: "ArrowLeft",
            label: D.KaratLeft,
            type: V.dI.Meta
        }
            , t = {
                key: "ArrowRight",
                label: D.KaratRight,
                type: V.dI.Meta
            }
            , r = {
                key: "SwitchKeys_Steam",
                label: D.Emoji,
                type: V.dI.Meta
            }
            , n = {
                key: "SwitchKeys_ABC",
                label: "ABC",
                type: V.dI.Meta
            }
            , i = {
                key: "Enter",
                label: "Enter",
                type: V.dI.Enter,
                leftActionButton: T.g4.RightTrigger
            }
            , a = {
                key: "VKClose",
                label: D.HideKeyboard,
                type: V.dI.Meta
            };
        return C.createElement(this.KeyboardPanel, {
            className: (0,
                G.A)(W().NumericKeypad)
        }, C.createElement(w.Z, {
            className: W().NumericLeftCtn
        }, this.RenderKey(4, 0, 0, r, 0), this.RenderKey(4, 0, 0, n, 1)), C.createElement(w.Z, {
            "flow-children": "grid",
            className: W().NumberPad
        }, te.s_rgNumericLayout.map(((e, t) => this.RenderKeyboardRow(e, void 0, t, 0, 0)))), C.createElement(w.Z, {
            className: W().NumericRightCtn
        }, this.RenderKey(4, 0, 0, e, 0), this.RenderKey(4, 0, 0, t, 1), C.createElement(w.Z, {
            className: W().Controls
        }, this.RenderKey(1, 0, 0, i, 0), this.RenderKey(2, 0, 0, a, 1))))
    }
    RenderSteamItemsAndEmojiKeyboard() {
        const e = this.state.layoutState == me.Layout_Emoji
            , t = te.s_rgSteamItemCategories[this.state.curEmojiCategoryIndex - this.m_emojiCategories.length]
            , r = e ? this.GetEmojiGridProps() : null
            , n = this.state.holdSource == v.Vz.LPAD && null !== this.state.longPressCol && null !== this.state.longPressRow
            , i = this.state.holdSource == v.Vz.RPAD && null !== this.state.longPressCol && null !== this.state.longPressRow
            , a = this.BShowGlyphs();
        return C.createElement(this.KeyboardPanel, {
            className: (0,
                G.A)(W().EmojiKeyboard)
        }, C.createElement(w.Z, {
            className: W().KeyboardEmojiHeader
        }, a && C.createElement(o.W, {
            className: W().CategoryScrollLeft,
            button: T.g4.LeftBumper
        }), !this.props.bStandalone && this.RenderTabBar(te.s_rgCombinedSteamAndEmojiRowHeader, void 0, -1, 0, 0), this.props.bStandalone && this.RenderTabBar(te.s_rgEmojiRowHeader, void 0, -1, 0, 0), a && C.createElement(o.W, {
            className: W().CategoryScrollRight,
            button: T.g4.RightBumper
        })), e && C.createElement(w.Z, {
            key: "KB.Emoji_Container",
            role: "tabpanel",
            "flow-children": "grid",
            className: W().KeyboardEmojiContainer,
            ref: this.m_emojiScrollRef,
            navEntryPreferPosition: I.iU.MAINTAIN_X
        }, r && C.createElement(Se, {
            ...r
        })), !e && C.createElement(ee, {
            filter: t,
            keyDown: this.state.keyDown.key,
            rgLayoutTouchCount: this.state.rgLayoutTouchCount,
            bAnyTrackpadActive: this.BHasTrackpadHover(),
            onKeyFocus: this.OnKeyFocus,
            onKeyHover: this.OnKeyHover
        }), this.RenderKeyboardRow(te.s_rgSteamItemsBottomRow(this.GetLayoutOptions()), void 0, 4, 0, 0), !n && C.createElement(Pe, {
            className: W().LeftTrackpad,
            pressed: this.state.bLeftTrackpadDown,
            input: this.m_trackpadInput,
            trackpad: v.pR.LPAD_TOUCH,
            fnCallback: this.OnLeftTrackpadAnalog
        }), !i && C.createElement(Pe, {
            className: W().RightTrackpad,
            pressed: this.state.bRightTrackpadDown,
            input: this.m_trackpadInput,
            trackpad: v.pR.RPAD_TOUCH,
            fnCallback: this.OnRightTrackpadAnalog
        }))
    }
    StartControllerInputWatchdogTimer() {
        SteamClient.Input.SetKeyboardActionset(!0, this.props.windowInstance.IsStandaloneKeyboardWindow());
        const e = window.setInterval((() => {
            SteamClient.Input.SetKeyboardActionset(!0, this.props.windowInstance.IsStandaloneKeyboardWindow())
        }
        ), 1e3);
        this.setState({
            watchdogTimer: e
        })
    }
    ClearControllerInputWatchdogTimer() {
        window.clearInterval(this.state.watchdogTimer),
            this.setState({
                watchdogTimer: null
            })
    }
    componentDidMount() {
        1 != u.O.GetKeyboardLayoutSettings().selectedLayouts.length && (this.SetLayoutNameTimeout(),
            this.setState({
                bShowLayoutName: !0
            })),
            this.m_trackpadInput.EnableAnalogInputMessages(!0),
            this.StartControllerInputWatchdogTimer()
    }
    componentWillUnmount() {
        this.StopResizeListening(),
            this.CancelBackpaceTimer(),
            this.DismissBackpaceTimer(),
            this.CancelLongPressTimer(),
            this.DismissLongPress(),
            this.ClearHoldTarget(),
            this.m_trackpadInput.EnableAnalogInputMessages(!1),
            this.ClearControllerInputWatchdogTimer()
    }
    render() {
        switch (this.state.layoutState) {
            case me.Layout_Emoji:
            case me.Layout_SteamItems:
                return this.RenderSteamItemsAndEmojiKeyboard();
            case me.Layout_Numeric:
                return this.RenderNumericKeyboard();
            case me.Layout_Standard:
            default:
                return this.RenderStandardKeyboard(this.state.standardLayout)
        }
    }
}