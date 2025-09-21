(e, t, r) => {
    "use strict";
    r.d(t, {
        FN: () => g.FN,
        I7: () => h,
        Nr: () => y,
        PE: () => C,
        _1: () => f,
        a1: () => B,
        dv: () => w,
        f0: () => I,
        hk: () => M,
        iv: () => _,
        jg: () => S,
        u6: () => b
    });
    var n = r(34629)
        , i = r(33572)
        , a = r(89193)
        , s = r(63696)
        , o = r(10975)
        , l = r(85688)
        , c = r(79769)
        , m = r(54644)
        , u = r(83599)
        , d = r(51115)
        , A = r(72476)
        , p = r(34776)
        , g = r(41537);
    const h = new u.wd("VirtualKeyboard").Debug;
    class C {
        k_rgKeyboardLocations = A.TS.ON_DECK ? ["center-bottom", "center-top"] : ["center-bottom", "lower-left", "upper-left", "center-top", "upper-right", "lower-right"];
        k_nKeyboardWindowOffset = 10;
        m_currentVirtualKeyboardRef = null;
        m_lastActiveVirtualKeyboardRef = null;
        m_bIsInlineVirtualKeyboardOpen = (0,
            c.Jc)(!1);
        m_bIsVirtualKeyboardModal = (0,
            c.Jc)(!1);
        m_OnActiveElementChanged = new c.lu;
        m_OnActiveElementClicked = new c.lu;
        m_bDismissOnEnter = !1;
        m_strDeadKeyPending = null;
        m_strDeadKeyNext = null;
        m_strDeadKeyCombined = null;
        m_bUseVRKeyboard = !1;
        m_ownerWindow;
        m_ActiveElementProps;
        m_iKeyboardLocation = 0;
        m_textFieldLocation = null;
        m_KeyboardOwners = new Set;
        m_OnTextEntered = new c.lu;
        constructor() {
            (0,
                a.Gn)(this)
        }
        Init(e, t) {
            this.m_bUseVRKeyboard = e,
                this.m_ownerWindow = t
        }
        BIsVRKeyboard() {
            return this.m_bUseVRKeyboard
        }
        SetVirtualKeyboardVisible() {
            this.SetVirtualKeyboardShownInternal(!0)
        }
        SetVirtualKeyboardHidden() {
            this.SetVirtualKeyboardShownInternal(!1)
        }
        SetVirtualKeyboardShownInternal(e) {
            if (0 != this.m_KeyboardOwners.size && (this.m_bIsInlineVirtualKeyboardOpen.Value != e || this.m_bUseVRKeyboard || !e))
                if (e || (this.ResetDeadKeyState(),
                    this.ClearCurrentVirtualKeyboardRef()),
                    this.m_bUseVRKeyboard)
                    e ? this.m_ownerWindow.SteamClient.OpenVR.Keyboard.Show() : this.m_ownerWindow.SteamClient.OpenVR.Keyboard.Hide();
                else if (this.m_bIsInlineVirtualKeyboardOpen.Set(e),
                    this.m_ActiveElementProps) {
                    const { onKeyboardShow: e } = this.m_ActiveElementProps;
                    null != e && e();
                    const { onKeyboardFullyVisible: t } = this.m_ActiveElementProps;
                    null != t && setTimeout((() => t()), 300)
                }
        }
        SetVirtualKeyboardDone() {
            (0,
                l.wT)(this.m_bUseVRKeyboard, "We should only be showing the Done button on VR keyboards"),
                this.m_ownerWindow.SteamClient.OpenVR.Keyboard.SendDone(),
                this.SetVirtualKeyboardHidden()
        }
        SetDismissOnEnterKey(e) {
            this.m_bDismissOnEnter = e
        }
        CreateVirtualKeyboardRef(e) {
            const t = {};
            return Object.assign(t, {
                ShowVirtualKeyboard: () => this.ShowVirtualKeyboard(t, e, !1),
                ShowModalKeyboard: () => this.ShowVirtualKeyboard(t, e, !0),
                SetAsCurrentVirtualKeyboardTarget: () => this.SetActiveVirtualKeyboardTarget(t, e),
                HideVirtualKeyboard: () => this.SetVirtualKeyboardHidden(),
                DelayHideVirtualKeyboard: (e = 100) => {
                    e ? (this.ClearCurrentVirtualKeyboardRef(),
                        window.setTimeout((() => {
                            this.m_currentVirtualKeyboardRef || this.SetVirtualKeyboardHidden()
                        }
                        ), e)) : this.SetVirtualKeyboardHidden()
                }
                ,
                BIsActive: () => this.m_currentVirtualKeyboardRef === t && this.m_bIsInlineVirtualKeyboardOpen.Value,
                BIsElementValidForInput: () => !e.BIsElementValidForInput || e.BIsElementValidForInput(),
                bInVR: this.m_bUseVRKeyboard
            }),
                t
        }
        ClearCurrentVirtualKeyboardRef() {
            this.m_currentVirtualKeyboardRef && (this.m_lastActiveVirtualKeyboardRef = this.m_currentVirtualKeyboardRef,
                this.m_currentVirtualKeyboardRef = null,
                this.m_ActiveElementProps = null,
                this.m_OnActiveElementChanged.Dispatch(null)),
                SteamClient.Input.SetKeyboardActionset(!1, !1)
        }
        AddVirtualKeyboardOwner(e) {
            this.m_KeyboardOwners.add(e)
        }
        RemoveVirtualKeyboardOwner(e) {
            this.m_KeyboardOwners.delete(e)
        }
        get IsShowingVirtualKeyboard() {
            return this.m_bIsInlineVirtualKeyboardOpen
        }
        get IsVirtualKeyboardModal() {
            return this.m_bIsVirtualKeyboardModal
        }
        get OnActiveElementChanged() {
            return this.m_OnActiveElementChanged
        }
        get OnActiveElementClicked() {
            return this.m_OnActiveElementClicked
        }
        get OnTextEntered() {
            return this.m_OnTextEntered
        }
        SetActiveVirtualKeyboardTarget(e, t) {
            this.m_ActiveElementProps = t,
                this.SetVirtualKeyboardActiveRef(e)
        }
        ShowVirtualKeyboard(e, t, r) {
            h("ShowVirtualKeyboard", {
                ref: e,
                props: t,
                bIsModal: r
            }),
                this.m_ActiveElementProps = t,
                this.m_bIsVirtualKeyboardModal.Set(r),
                this.SetVirtualKeyboardActiveRef(e),
                this.SetVirtualKeyboardVisible(),
                o.eZ.PlayNavSound(o.PN.OpenSideMenu),
                setTimeout((() => document.activeElement?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                })), 0)
        }
        RestoreVirtualKeyboardForLastActiveElement() {
            !this.m_currentVirtualKeyboardRef && this.m_lastActiveVirtualKeyboardRef && this.m_lastActiveVirtualKeyboardRef.BIsElementValidForInput() && this.m_lastActiveVirtualKeyboardRef.ShowVirtualKeyboard()
        }
        SetVirtualKeyboardActiveRef(e) {
            this.m_currentVirtualKeyboardRef !== e ? (this.m_currentVirtualKeyboardRef = e,
                this.m_OnActiveElementChanged.Dispatch(e)) : this.m_OnActiveElementClicked.Dispatch(e)
        }
        HandleNavOut(e) {
            const { onKeyboardNavOut: t } = this.m_ActiveElementProps;
            if (null != t) {
                const e = "function" == typeof t ? t() : t;
                return !!e && (this.HandleVirtualKeyDown(e),
                    !0)
            }
            this.SetVirtualKeyboardHidden()
        }
        GetEnterKeyLabel() {
            return this.m_ActiveElementProps?.strEnterKeyLabel
        }
        HandleDeadKeyDown(e, t, r) {
            if (this.m_strDeadKeyPending) {
                const e = this.m_strDeadKeyCombined;
                if (this.ResetDeadKeyState(),
                    r === e)
                    return this.HandleVirtualKeyDown(r.charAt(0)),
                        void this.HandleVirtualKeyDown(r.charAt(0));
                this.HandleVirtualKeyDown(e.charAt(0))
            }
            (0,
                l.wT)(" " == t.charAt(0), "Dead key characters should start with a space"),
                (0,
                    l.wT)(r.length == t.length, "Dead key composition length mismatch"),
                this.m_strDeadKeyPending = e,
                this.m_strDeadKeyNext = t,
                this.m_strDeadKeyCombined = r
        }
        GetDeadKeyPending() {
            return this.m_strDeadKeyPending
        }
        ResetDeadKeyState() {
            this.m_strDeadKeyPending = null,
                this.m_strDeadKeyNext = null,
                this.m_strDeadKeyCombined = null
        }
        SendClientPasteCommand() {
            const e = (0,
                A.Pr)() ? 102 : 103;
            SteamClient.Input.ControllerKeyboardSetKeyState(e, !0),
                SteamClient.Input.ControllerKeyboardSetKeyState(25, !0),
                SteamClient.Input.ControllerKeyboardSetKeyState(25, !1),
                SteamClient.Input.ControllerKeyboardSetKeyState(e, !1)
        }
        HandleVirtualKeyDown(e, t) {
            if (h(`VK > input: ${e}`),
                this.m_strDeadKeyPending) {
                const r = this.m_strDeadKeyNext
                    , n = this.m_strDeadKeyCombined;
                this.ResetDeadKeyState();
                const i = r.indexOf(e);
                if (i >= 0)
                    return void this.HandleVirtualKeyDown(n.charAt(i), t)
            }
            if ("Enter" == e)
                if (this.m_ActiveElementProps?.onEnterKeyPress) {
                    if (!(e = "function" == typeof this.m_ActiveElementProps.onEnterKeyPress ? this.m_ActiveElementProps.onEnterKeyPress() || null : this.m_ActiveElementProps.onEnterKeyPress))
                        return
                } else if (this.m_bDismissOnEnter)
                    return h("VKM.HandleVirtualKeyDown DismissOnEnter"),
                        this.DispatchKeypress(e),
                        void (t || (this.m_bDismissOnEnter = !1,
                            this.SetVirtualKeyboardHidden()));
            return "VKClose" == e ? (h("VKM.HandleVirtualKeyDown VKClose"),
                void this.SetVirtualKeyboardHidden()) : "VKDone" == e ? (h("VKM.HandleVirtualKeyDown VKDone"),
                    void this.SetVirtualKeyboardDone()) : "VKPaste" == e ? (h("VKM.HandleVirtualKeyDown VKPaste"),
                        void this.SendClientPasteCommand()) : void this.DispatchKeypress(e)
        }
        DispatchKeypress(e) {
            this.OnTextEntered.Dispatch(e),
                this.m_ActiveElementProps?.onTextEntered ? this.m_ActiveElementProps.onTextEntered(e) : this.m_bUseVRKeyboard ? f(e) : _(e)
        }
        get KeyboardLocation() {
            return this.k_rgKeyboardLocations[this.m_iKeyboardLocation]
        }
        InitKeyboardLocation(e, t, r) {
            if (!e && !t)
                return;
            const n = e ? p.O.InitialLocationDesktop : p.O.InitialLocationOverlay
                , i = this.k_rgKeyboardLocations.indexOf(n);
            this.RotateKeyboardLocation(e, r, -1 != i ? i : 0)
        }
        RotateKeyboardLocation(e, t, r = -1) {
            this.m_iKeyboardLocation = r >= 0 ? r : (this.m_iKeyboardLocation + 1) % this.k_rgKeyboardLocations.length,
                e && t?.SteamClient.Window.MoveToLocation(this.KeyboardLocation, this.k_nKeyboardWindowOffset)
        }
        SetTextFieldLocation(e, t, r, n) {
            this.m_textFieldLocation = {
                top: t,
                right: e + r,
                bottom: t + n,
                left: e
            }
        }
        SelectBestModalPosition(e) {
            if (!this.m_textFieldLocation)
                return;
            const t = e.parentElement.getBoundingClientRect()
                , r = (t.width - e.offsetWidth) / 2
                , n = t.width - e.offsetWidth
                , i = t.height - e.offsetHeight;
            let a = e.ownerDocument.defaultView?.devicePixelRatio ?? 1;
            const s = t => {
                let s = 0
                    , o = 0;
                switch (t) {
                    case "center-bottom":
                        s = r,
                            o = i;
                        break;
                    case "lower-left":
                        s = 0,
                            o = i;
                        break;
                    case "upper-left":
                        s = 0,
                            o = 0;
                        break;
                    case "center-top":
                        s = r,
                            o = 0;
                        break;
                    case "upper-right":
                        s = n,
                            o = 0;
                        break;
                    case "lower-right":
                        s = n,
                            o = i
                }
                let l = {
                    top: o * a,
                    left: s * a,
                    bottom: (o + e.offsetHeight) * a,
                    right: (s + e.offsetWidth) * a
                };
                return (0,
                    m.bZ)(l, this.m_textFieldLocation)
            }
                ;
            if (s(this.KeyboardLocation) > 0)
                return void (this.m_textFieldLocation = null);
            let o = this.m_iKeyboardLocation
                , l = 0;
            for (let e = 0; e < this.k_rgKeyboardLocations.length; ++e) {
                let t = s(this.k_rgKeyboardLocations[e]);
                t > l && (l = t,
                    o = e)
            }
            o != this.m_iKeyboardLocation && (this.m_iKeyboardLocation = o),
                this.m_textFieldLocation = null
        }
    }
    function _(e) {
        switch (e) {
            case "Backspace":
                e = "";
                break;
            case "Enter":
                e = "";
                break;
            case "Tab":
                e = "\t";
                break;
            case "ArrowLeft":
                e = "";
                break;
            case "ArrowRight":
                e = "";
                break;
            case "ArrowUp":
                e = "";
                break;
            case "ArrowDown":
                e = ""
        }
        SteamClient.Input.ControllerKeyboardSendText(e)
    }
    function f(e) {
        switch (e) {
            case "Backspace":
                e = "\b";
                break;
            case "Enter":
                e = "\n";
                break;
            case "Tab":
                e = "\t";
                break;
            case "ArrowLeft":
                e = "[D";
                break;
            case "ArrowRight":
                e = "[C";
                break;
            case "ArrowUp":
                e = "[A";
                break;
            case "ArrowDown":
                e = "[B"
        }
        "" !== e && SteamClient.OpenVR.Keyboard.SendText(e)
    }
    function b() {
        const e = (0,
            i.D7)();
        return (0,
            d.gc)(e.IsShowingVirtualKeyboard)
    }
    function y() {
        const e = (0,
            i.D7)();
        return (0,
            d.gc)(e.IsVirtualKeyboardModal)
    }
    function w(e) {
        const t = (0,
            i.D7)();
        (0,
            d.x2)(t.IsShowingVirtualKeyboard, e)
    }
    function B(e, t) {
        s.useEffect((() => (e.AddVirtualKeyboardOwner(t),
            () => e.RemoveVirtualKeyboardOwner(t))), [e, t])
    }
    function S(e) {
        const t = (0,
            i.D7)();
        s.useEffect((() => {
            if (e)
                return t.OnTextEntered.Register(e).Unregister
        }
        ), [t, e])
    }
    (0,
        n.Cg)([a.sH], C.prototype, "m_strDeadKeyPending", void 0),
        (0,
            n.Cg)([a.sH], C.prototype, "m_iKeyboardLocation", void 0);
    const v = "DEBUG_StickyKeyboard";
    function I() {
        return !1
    }
    function M(e) {
        e ? window.sessionStorage.setItem(v, "true") : window.sessionStorage.removeItem(v)
    }
}
