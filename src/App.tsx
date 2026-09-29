import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Home,
  Search,
  Users,
  UserRound,
  QrCode,
  Martini,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  X,
  ChevronRight,
  Heart,
  MapPin,
  Send,
  Check,
  SlidersHorizontal,
  MoreHorizontal,
  ReceiptText,
  CalendarDays,
  CreditCard,
  Share2,
  Sparkles,
  House,
  Music,
  Clock,
  Lock,
  Copy,
  Camera,
  Bookmark,
  Star,
  Pencil,
  LogOut,
  Wine,
  Beer,
  Utensils,
  ExternalLink,
} from "lucide-react";
import QRCode from "qrcode";
import type { Html5Qrcode } from "html5-qrcode";
import { venues, drinks, initialState } from "./data";
import type { State, Venue, Friend, Drink, Item, Round, Receipt } from "./data";
import {
  money,
  subtotal,
  totals,
  splitCents,
  canClose,
  makeRound,
} from "./domain.mjs";

type Route = { page: string; id?: string };
type Modal = { type: string; id?: string };
const KEY = "tab-app-v1";
function load(): State {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v?.version === 1 &&
      Array.isArray(v.friends) &&
      Array.isArray(v.receipts)
      ? v
      : structuredClone(initialState);
  } catch {
    return structuredClone(initialState);
  }
}
const venueById = (id?: string) => venues.find((v) => v.id === id) || venues[0];
const Btn = ({
  children,
  onClick,
  secondary = false,
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  secondary?: boolean;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    className={`button ${secondary ? "secondary" : ""} ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);
const IconBtn = ({
  label,
  children,
  onClick,
  className = "",
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    className={`icon-button ${className}`}
    aria-label={label}
    title={label}
    onClick={onClick}
  >
    {children}
  </button>
);
function Avatar({
  friend,
  size = "normal",
}: {
  friend: Pick<Friend, "name" | "color" | "status">;
  size?: string;
}) {
  return (
    <span className={`avatar ${friend.color} ${size}`}>
      {friend.name[0]}
      {friend.status && (
        <i
          className={`status-dot ${friend.status === "Going out" ? "out" : friend.status === "Staying in" ? "in" : "flexible"}`}
        />
      )}
    </span>
  );
}
function Section({
  title,
  action = "See all",
  onClick,
}: {
  title: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {onClick && (
        <button className="text-button" onClick={onClick}>
          {action}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
function Empty({
  icon = <Martini />,
  title,
  detail,
  action,
  onClick,
}: {
  icon?: ReactNode;
  title: string;
  detail: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">{icon}</span>
      <h2>{title}</h2>
      <p>{detail}</p>
      {action && onClick && <Btn onClick={onClick}>{action}</Btn>}
    </div>
  );
}
function Row({
  icon,
  children,
  detail,
  onClick,
  danger = false,
}: {
  icon?: ReactNode;
  children: ReactNode;
  detail?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      className={`action-row ${danger ? "danger" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{children}</span>
      {detail && <small>{detail}</small>}
      <ChevronRight size={16} />
    </button>
  );
}
function Chips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="chips">
      {options.map((o) => (
        <button
          key={o}
          className={`chip ${value === o ? "selected" : ""}`}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
function QrImage({ value }: { value: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(value, {
      width: 560,
      margin: 2,
      color: { dark: "#16112f", light: "#dcd0ff" },
      errorCorrectionLevel: "H",
    }).then(setSrc);
  }, [value]);
  return src ? (
    <img className="qr-image" src={src} alt="Scannable TAB code" />
  ) : (
    <div className="qr-image" />
  );
}

export default function App() {
  const [state, setState] = useState<State>(load);
  const [route, setRoute] = useState<Route>({ page: "home" });
  const history = useRef<Route[]>([]);
  const [modal, setModal] = useState<Modal | null>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [socialFilter, setSocialFilter] = useState("All");
  const [menuCategory, setMenuCategory] = useState("Cocktails");
  const [venueSection, setVenueSection] = useState("Menu");
  const [tip, setTip] = useState(20);
  const [splitCount, setSplitCount] = useState(1);
  const [showServer, setShowServer] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const [storageError, setStorageError] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const update = (fn: (s: State) => State) => setState((s) => fn(s));
  const notify = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };
  const go = (page: string, id?: string) => {
    history.current.push(route);
    setRoute({ page, id });
    setModal(null);
    setShowServer(false);
    window.scrollTo(0, 0);
  };
  const back = () => {
    setModal(null);
    setShowServer(false);
    setRoute(history.current.pop() || { page: "home" });
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state]);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const v = params.get("venue");
    if (v && venues.some((x) => x.id === v)) setRoute({ page: "venue", id: v });
    if (params.has("friend")) setModal({ type: "addFriend" });
  }, []);
  const favorite = (id: string) =>
    update((s) => ({
      ...s,
      favorites: s.favorites.includes(id)
        ? s.favorites.filter((x) => x !== id)
        : [...s.favorites, id],
    }));
  const friendById = (id?: string) =>
    state.friends.find((f) => f.id === id) || state.friends[0];
  const activity = (
    s: State,
    type: string,
    title: string,
    detail: string,
    amount?: number,
  ): State => ({
    ...s,
    activity: [
      { id: crypto.randomUUID(), type, title, detail, amount },
      ...s.activity,
    ],
  });
  const sendRound = (base: State) => {
    if (!base.tab || !base.cart.length) return base;
    const r = makeRound(base.cart, base.nextOrder) as Round;
    return activity(
      {
        ...base,
        tab: { ...base.tab, rounds: [...base.tab.rounds, r] },
        cart: [],
        cartVenue: null,
        nextOrder: base.nextOrder + 1,
      },
      "Orders",
      `Order #${r.id} received`,
      `${venueById(base.tab.venueId).name} · preparing your round`,
    );
  };
  const authorize = (method: string, group: boolean) => {
    const vid = modal?.id || route.id || state.cartVenue || venues[0].id;
    if (state.cart.length && state.cartVenue !== vid) {
      notify(
        "Send or clear your pending round before opening a tab at another venue.",
      );
      return;
    }
    const next = sendRound({
      ...state,
      tab: {
        venueId: vid,
        group,
        members: [],
        method,
        rounds: [],
        split: "Pay what you order",
      },
    });
    setState(next);
    go(
      next.tab!.rounds.length ? "order" : "venue",
      next.tab!.rounds.length ? String(next.tab!.rounds.at(-1)!.id) : vid,
    );
    notify("Demo tab opened. Nothing charged.");
  };
  const submitRound = () => {
    if (!state.cart.length) return;
    if (!state.tab) {
      setModal({ type: "open", id: state.cartVenue! });
      return;
    }
    if (state.tab.venueId !== state.cartVenue) {
      notify("Close your current tab before ordering at another venue.");
      return;
    }
    const id = state.nextOrder;
    setState(sendRound(state));
    go("order", String(id));
  };
  const addToCart = (item: Item, vid: string) => {
    if (state.tab && state.tab.venueId !== vid) {
      notify(
        `You have an open tab at ${venueById(state.tab.venueId).name}. Close it first.`,
      );
      return;
    }
    if (state.cart.length && state.cartVenue !== vid) {
      notify("Send or clear your current round before changing venues.");
      return;
    }
    update((s) => ({ ...s, cartVenue: vid, cart: [...s.cart, item] }));
    go("venue", vid);
    notify(`${item.quantity} ${item.name} added to your round`);
  };
  const closeTab = () => {
    if (!state.tab || !canClose(state.tab)) return;
    const receipt: Receipt = {
      id: `TAB-${state.nextOrder - 1}-${Date.now()}`,
      venueId: state.tab.venueId,
      rounds: state.tab.rounds,
      createdAt: Date.now(),
      tipPercent: tip,
      method: state.tab.method,
      rating: 0,
      splitCount,
    };
    const amount = totals(state.tab.rounds, tip).total;
    update((s) =>
      activity(
        { ...s, receipts: [receipt, ...s.receipts], tab: null },
        "Payments",
        `Tab closed at ${venueById(receipt.venueId).name}`,
        "Demo payment completed",
        amount,
      ),
    );
    go("receipt", receipt.id);
  };
  const share = async (title: string, text: string, url?: string) => {
    try {
      if (navigator.share) await navigator.share({ title, text, url });
      else {
        await navigator.clipboard.writeText(
          [text, url].filter(Boolean).join("\n"),
        );
        notify("Link copied");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        notify("Sharing is unavailable. Copy the link below.");
    }
  };
  const poke = (f: Friend) => {
    update((s) =>
      activity(
        s,
        "Friends",
        `You poked ${f.name}`,
        "A little hello for tonight",
      ),
    );
    notify(`Poked ${f.name} · demo activity saved`);
  };
  const navActive = ["home", "explore", "social", "profile"].includes(
    route.page,
  )
    ? route.page
    : ["friend", "friends", "plans"].includes(route.page)
      ? "social"
      : ["code", "settings", "cards"].includes(route.page)
        ? "profile"
        : "explore";
  const currentVenue = venueById(route.id);
  const activeTotal = state.tab ? totals(state.tab.rounds).total : 0;
  const searchBox = (
    <div className="search-row">
      <div className="search-field">
        <Search size={20} />
        <input
          autoFocus={route.page === "explore"}
          aria-label="Search bars"
          placeholder="Search bars"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (route.page !== "explore") go("explore");
          }}
          onFocus={() => {
            if (route.page !== "explore") go("explore");
          }}
        />
        {search && (
          <IconBtn label="Clear search" onClick={() => setSearch("")}>
            <X size={16} />
          </IconBtn>
        )}
      </div>
      <IconBtn
        label="Scan a TAB code"
        className="scan-shortcut"
        onClick={() => setModal({ type: "scan" })}
      >
        <QrCode size={24} />
      </IconBtn>
    </div>
  );
  const venueCard = (v: Venue) => (
    <button className="venue-card" key={v.id} onClick={() => go("venue", v.id)}>
      <div className={`venue-art ${v.mood}`}>
        <div className="venue-art-mark">
          {v.id === "house-of-yes" ? (
            <>
              YES
              <br />
              YES
              <br />
              YES
            </>
          ) : v.id === "elsewhere" ? (
            <>
              else
              <br />
              where.
            </>
          ) : v.id === "babys" ? (
            <>
              baby’s
              <br />
              all right.
            </>
          ) : (
            v.name
          )}
        </div>
        <span className="venue-art-tag">{v.tags[0]}</span>
      </div>
      <div className="venue-card-copy">
        <div>
          <h3>{v.name}</h3>
          <p>
            <MapPin size={12} />
            {v.area}
          </p>
        </div>
        <span className="round-arrow">
          <ChevronRight size={18} />
        </span>
      </div>
    </button>
  );
  const header = (title: string, right?: ReactNode) => (
    <div className="page-header">
      <h1>{title}</h1>
      {right}
    </div>
  );
  const backHeader = (title?: string) => (
    <div className="back-header">
      <IconBtn label="Go back" onClick={back}>
        <ArrowLeft size={20} />
      </IconBtn>
      {title && <h2>{title}</h2>}
      <span />
    </div>
  );
  let content: ReactNode;
  if (route.page === "home")
    content = (
      <>
        <div className="brand-row">
          <button className="wordmark" onClick={() => go("home")}>
            tab{" "}
            <span className="brand-dots">
              <i />
              <i />
            </span>
          </button>
          {state.tab ? (
            <button className="active-pill" onClick={() => go("tab")}>
              <i />
              {venueById(state.tab.venueId).name} · {money(activeTotal)}
            </button>
          ) : (
            <button
              className="demo-pill"
              onClick={() => setModal({ type: "about" })}
            >
              DEMO
            </button>
          )}
        </div>
        <div className="home-heading">
          <h1>
            Where to
            <br className="tiny-break" /> tonight?
          </h1>
          <Martini className="hero-martini" size={39} />
        </div>
        {searchBox}
        {state.tab && (
          <button className="active-tab-banner" onClick={() => go("tab")}>
            <span className="ticket-number">
              #{state.tab.rounds.at(-1)?.id || state.nextOrder}
            </span>
            <span>
              <strong>Your tab at {venueById(state.tab.venueId).name}</strong>
              <small>
                {state.tab.rounds.length} rounds · {money(activeTotal)}
              </small>
            </span>
            <b>Open</b>
          </button>
        )}
        <Section title="Discover" onClick={() => go("explore")} />
        <Chips
          options={[
            "All",
            "Bars",
            "Dive Bars",
            "Speakeasies",
            "Rooftop",
            "Cocktails",
            "Live Music",
            "Nearby",
          ]}
          value={category}
          onChange={(v) => {
            setCategory(v);
            go("explore");
          }}
        />
        <Section title="My friends" onClick={() => go("friends")} />
        <div className="friend-strip">
          {state.friends.slice(0, 4).map((f) => (
            <button key={f.id} onClick={() => go("friend", f.id)}>
              <Avatar friend={f} />
              <span>{f.name}</span>
            </button>
          ))}
          <button onClick={() => setModal({ type: "addFriend" })}>
            <span className="add-avatar">
              <Plus />
            </span>
            <span>Add</span>
          </button>
        </div>
        <Section title="Folks out tonight" />
        <div className="folks">
          {state.friends
            .filter((f) => f.status === "Going out")
            .map((f) => (
              <div className="folk-row" key={f.id}>
                <button
                  className="folk-person"
                  onClick={() => go("friend", f.id)}
                >
                  <Avatar friend={f} size="small" />
                  <span>
                    <strong>{f.name}</strong>
                    <small>{venueById(f.venue).name}</small>
                  </span>
                </button>
                <button className="chip" onClick={() => poke(f)}>
                  Poke
                </button>
                <IconBtn
                  label={`Join ${f.name}`}
                  onClick={() => go("venue", f.venue)}
                >
                  <MapPin size={17} />
                </IconBtn>
                <IconBtn
                  label={`${f.name} options`}
                  onClick={() => go("friend", f.id)}
                >
                  <MoreHorizontal size={18} />
                </IconBtn>
              </div>
            ))}
          <div className="folk-row">
            <button className="folk-person" onClick={() => go("plans")}>
              <div className="avatar-stack">
                {state.friends.slice(1, 4).map((f) => (
                  <Avatar key={f.id} friend={f} size="tiny" />
                ))}
              </div>
              <span>
                <strong>Your next night out</strong>
                <small>
                  {state.plans.filter((p) => p.rsvp === "Going").length} plans
                  with your people
                </small>
              </span>
            </button>
            <IconBtn label="View plans" onClick={() => go("plans")}>
              <CalendarDays size={18} />
            </IconBtn>
          </div>
        </div>
        <Section
          title="A change of scene"
          action="Explore"
          onClick={() => go("explore")}
        />
        <div className="venue-carousel">
          {venues.slice(0, 3).map(venueCard)}
        </div>
        <Section title="History" onClick={() => go("history")} />
        {state.receipts.length ? (
          <ReceiptRow
            receipt={state.receipts[0]}
            onClick={() => go("receipt", state.receipts[0].id)}
          />
        ) : (
          <button className="history-empty" onClick={() => go("explore")}>
            <ReceiptText size={24} />
            <span>
              <strong>Your next night starts here</strong>
              <small>Closed tabs will live here.</small>
            </span>
            <ChevronRight size={18} />
          </button>
        )}
      </>
    );
  else if (route.page === "explore" || route.page === "favorites") {
    const filtered = venues.filter(
      (v) =>
        (route.page !== "favorites" || state.favorites.includes(v.id)) &&
        (!search ||
          `${v.name} ${v.area} ${v.tags.join(" ")}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (category === "All" ||
          category === "Nearby" ||
          v.tags.includes(category)),
    );
    content = (
      <>
        {header(
          route.page === "favorites" ? "Your favorites" : "Find your night",
          <IconBtn
            label="View favorites"
            onClick={() => {
              setCategory("All");
              setSearch("");
              go("favorites");
            }}
          >
            <Heart size={21} />
          </IconBtn>,
        )}
        {searchBox}
        <Chips
          options={[
            "All",
            "Bars",
            "Dive Bars",
            "Speakeasies",
            "Rooftop",
            "Cocktails",
            "Live Music",
            "Nearby",
          ]}
          value={category}
          onChange={setCategory}
        />
        <div className="results-label">
          {filtered.length} {filtered.length === 1 ? "SPOT" : "SPOTS"}
          {category === "Nearby" ? " · NYC DEMO VENUES" : ""}
        </div>
        {filtered.length ? (
          <div className="venue-grid">{filtered.map(venueCard)}</div>
        ) : (
          <Empty
            title="No spots just yet"
            detail={
              route.page === "favorites"
                ? "Tap the heart on a venue to keep it close."
                : "Try another name or category."
            }
            action="Show all spots"
            onClick={() => {
              setSearch("");
              setCategory("All");
              go("explore");
            }}
          />
        )}
        <p className="demo-note">
          Curated demo venues. Menus, prices, hours, and availability are
          illustrative.
        </p>
      </>
    );
  } else if (route.page === "venue")
    content = (
      <>
        <div className={`venue-hero ${currentVenue.mood}`}>
          <div className="venue-hero-art">
            {currentVenue.id === "house-of-yes"
              ? "YES"
              : currentVenue.id === "elsewhere"
                ? "elsewhere."
                : currentVenue.name}
          </div>
          <div className="venue-top">
            <IconBtn label="Go back" onClick={back}>
              <ArrowLeft size={20} />
            </IconBtn>
            <IconBtn
              label={
                state.favorites.includes(currentVenue.id)
                  ? "Remove from favorites"
                  : "Save to favorites"
              }
              onClick={() => favorite(currentVenue.id)}
            >
              <Heart
                size={21}
                fill={
                  state.favorites.includes(currentVenue.id)
                    ? "currentColor"
                    : "none"
                }
              />
            </IconBtn>
          </div>
          <div className="venue-title">
            <button
              className="story-button"
              onClick={() => go("story", currentVenue.id)}
            >
              <Share2 size={13} />
              Share to story
            </button>
            <h1>{currentVenue.name}</h1>
            <p>
              <MapPin size={13} />
              {currentVenue.area}
            </p>
          </div>
        </div>
        <div className="venue-tags">
          {currentVenue.tags.map((t) => (
            <span className="chip" key={t}>
              {t}
            </span>
          ))}
        </div>
        {state.tab?.venueId === currentVenue.id ? (
          <Btn onClick={() => go("tab")}>
            <ReceiptText size={20} />
            <span>
              Your {state.tab.group ? "group " : ""}tab · {money(activeTotal)}
              <small>
                {state.tab.rounds.length} rounds · keep the night going
              </small>
            </span>
          </Btn>
        ) : (
          <Btn
            onClick={() =>
              state.tab
                ? notify(
                    `Close your tab at ${venueById(state.tab.venueId).name} first.`,
                  )
                : setModal({ type: "open", id: currentVenue.id })
            }
          >
            <ReceiptText size={20} />
            <span>
              Open a tab<small>Order all night · pay once when you leave</small>
            </span>
          </Btn>
        )}
        <div className="tabs">
          {["Menu", "Info", "Group"].map((t) => (
            <button
              className={venueSection === t ? "active" : ""}
              key={t}
              onClick={() => setVenueSection(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {venueSection === "Menu" ? (
          <>
            <div className="horizontal-scroll">
              <Chips
                options={[
                  "Cocktails",
                  "Beer",
                  "Wine",
                  "Non-Alc",
                  "Small Bites",
                ]}
                value={menuCategory}
                onChange={setMenuCategory}
              />
            </div>
            <div className="menu-list">
              {drinks
                .filter((d) => d.category === menuCategory)
                .map((d) => (
                  <button
                    className="menu-item"
                    key={d.id}
                    onClick={() => go("drink", `${currentVenue.id}/${d.id}`)}
                  >
                    <span className={`drink-thumb ${d.color}`}>
                      {d.category === "Beer" ? (
                        <Beer />
                      ) : d.category === "Wine" ? (
                        <Wine />
                      ) : d.category === "Small Bites" ? (
                        <Utensils />
                      ) : (
                        <Martini />
                      )}
                    </span>
                    <span className="menu-copy">
                      <strong>{d.name}</strong>
                      <small>{d.description}</small>
                    </span>
                    <b>{money(d.price).replace(".00", "")}</b>
                  </button>
                ))}
            </div>
            <p className="demo-note">
              Demo menu · NYC tax calculated at checkout.
            </p>
          </>
        ) : venueSection === "Info" ? (
          <div className="info-panel">
            <h2>A little about the spot</h2>
            <p>{currentVenue.description}</p>
            <Row
              icon={<MapPin />}
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentVenue.address)}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              {currentVenue.address}
            </Row>
            <div className="info-line">
              <Clock size={18} />
              {currentVenue.hours}
            </div>
            <p className="demo-note">
              Check directly with the venue for current hours and events.
            </p>
            <Btn
              secondary
              onClick={() => setModal({ type: "invite", id: currentVenue.id })}
            >
              <Send size={18} />
              Invite friends
            </Btn>
          </div>
        ) : (
          <div className="info-panel">
            <h2>Better together.</h2>
            <p>
              Bring your people. One place for every round, and a clear view of
              who ordered what.
            </p>
            <div className="friend-strip">
              {state.friends.map((f) => (
                <button key={f.id} onClick={() => go("friend", f.id)}>
                  <Avatar friend={f} />
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
            <Btn
              onClick={() => setModal({ type: "invite", id: currentVenue.id })}
            >
              <Users size={19} />
              Plan a night here
            </Btn>
            {state.tab?.venueId === currentVenue.id && (
              <Btn secondary onClick={() => go("tab")}>
                View your tab
              </Btn>
            )}
          </div>
        )}
        {state.cartVenue === currentVenue.id && state.cart.length > 0 && (
          <div className="sticky-round">
            <Btn onClick={() => setModal({ type: "round" })}>
              <span className="count-badge">
                {state.cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
              Review your round
              <span className="push-right">{money(subtotal(state.cart))}</span>
            </Btn>
          </div>
        )}
      </>
    );
  else if (route.page === "drink") {
    const [vid, did] = route.id!.split("/");
    const d = drinks.find((x) => x.id === did)!;
    content = (
      <DrinkView
        drink={d}
        venue={venueById(vid)}
        state={state}
        back={back}
        add={(item) => addToCart(item, vid)}
      />
    );
  } else if (route.page === "friends")
    content = (
      <>
        {header(
          "Your people",
          <IconBtn
            label="Add friend"
            onClick={() => setModal({ type: "addFriend" })}
          >
            <Plus />
          </IconBtn>,
        )}
        <p className="subheading">Good nights start with good company.</p>
        <div className="panel">
          {state.friends.map((f) => (
            <button
              key={f.id}
              className="friend-list-row"
              onClick={() => go("friend", f.id)}
            >
              <Avatar friend={f} />
              <span>
                <strong>{f.name}</strong>
                <small>
                  {f.status === "Going out"
                    ? `At ${venueById(f.venue).name}`
                    : f.status}
                </small>
              </span>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
        <Btn secondary onClick={() => go("code")}>
          <QrCode size={18} />
          Show my TAB code
        </Btn>
      </>
    );
  else if (route.page === "friend") {
    const f = friendById(route.id);
    content = f ? (
      <>
        {backHeader()}
        <div className="friend-profile">
          <Avatar friend={f} size="large" />
          <h1>{f.name}</h1>
          <p>
            {f.status === "Going out"
              ? `At ${venueById(f.venue).name}`
              : f.status}
          </p>
          <small>
            {f.status === "Going out"
              ? "Out with the good people"
              : f.status === "Staying in"
                ? "Low key tonight"
                : "I’m flexible"}
          </small>
          <button className="chip" onClick={() => poke(f)}>
            Poke
          </button>
        </div>
        <div className="action-stack">
          <Row
            icon={<Send />}
            onClick={() =>
              setModal({ type: "invite", id: f.venue || "elsewhere" })
            }
          >
            Invite out
          </Row>
          {f.status === "Going out" ? (
            <Row icon={<Martini />} onClick={() => go("venue", f.venue)}>
              Join at {venueById(f.venue).name}
            </Row>
          ) : f.status === "Staying in" ? (
            <div className="action-row muted">
              <House />
              <span>{f.name} is staying in</span>
              <small>Low key tonight</small>
            </div>
          ) : (
            <Row icon={<Sparkles />} onClick={() => go("explore")}>
              Suggest a spot
            </Row>
          )}
          <Row
            icon={<CreditCard />}
            onClick={() => setModal({ type: "cover", id: f.id })}
          >
            Pay {f.name}’s tab
          </Row>
          <Row icon={<CalendarDays />} onClick={() => go("plans", f.id)}>
            View shared plans
          </Row>
          <Row
            icon={<X />}
            danger
            onClick={() => setModal({ type: "removeFriend", id: f.id })}
          >
            Remove friend
          </Row>
        </div>
      </>
    ) : (
      <Empty
        title="Friend removed"
        detail="You can add them again any time."
        action="Your friends"
        onClick={() => go("friends")}
      />
    );
  } else if (route.page === "profile")
    content = (
      <>
        {header(
          "Profile",
          <IconBtn
            label="Edit profile"
            onClick={() => setModal({ type: "editProfile" })}
          >
            <Pencil size={19} />
          </IconBtn>,
        )}
        <div className="profile-summary">
          <Avatar
            friend={{
              name: state.profile.name,
              color: "lilac",
              status: state.profile.status,
            }}
            size="large"
          />
          <div>
            <h2>{state.profile.name}</h2>
            <small>@{state.profile.handle}</small>
            <p>{state.profile.bio}</p>
          </div>
        </div>
        <div className="profile-tags">
          <span>
            <MapPin size={13} />
            Brooklyn, NY
          </span>
          <span>
            <Sparkles size={13} />
            Here for a good night
          </span>
        </div>
        <Section title="Status" />
        <p className="subheading small">Let friends know what you’re up to.</p>
        <div className="status-options">
          {[
            { name: "Going out", text: "Let’s link up", icon: <Martini /> },
            { name: "Staying in", text: "Low key tonight", icon: <House /> },
            {
              name: "Open to suggestions",
              text: "I’m flexible",
              icon: <Sparkles />,
            },
          ].map((o) => (
            <button
              key={o.name}
              className={state.profile.status === o.name ? "selected" : ""}
              onClick={() =>
                update((s) => ({
                  ...s,
                  profile: { ...s.profile, status: o.name },
                }))
              }
            >
              {o.icon}
              <strong>{o.name}</strong>
              <small>{o.text}</small>
              {state.profile.status === o.name && (
                <i className="selected-dot" />
              )}
            </button>
          ))}
        </div>
        <div className="panel">
          <Row
            icon={<Users />}
            detail={String(state.friends.length)}
            onClick={() => go("friends")}
          >
            Friends
          </Row>
          <Row
            icon={<CalendarDays />}
            detail={`${state.plans.filter((p) => p.rsvp !== "Can’t" && p.rsvp !== "Declined").length} plans`}
            onClick={() => go("plans")}
          >
            Plans
          </Row>
          <Row
            icon={<CreditCard />}
            detail="Demo wallet"
            onClick={() => go("cards")}
          >
            Payment methods
          </Row>
          <Row
            icon={<Heart />}
            detail={String(state.favorites.length)}
            onClick={() => {
              setCategory("All");
              setSearch("");
              go("favorites");
            }}
          >
            Favorites
          </Row>
        </div>
        <div className="panel">
          <Row
            icon={<QrCode className="purple-icon" />}
            onClick={() => go("code")}
          >
            Show my TAB code
          </Row>
        </div>
        <Row icon={<SlidersHorizontal />} onClick={() => go("settings")}>
          Settings & demo details
        </Row>
      </>
    );
  else if (route.page === "code") {
    const link = `${location.origin}${location.pathname}?friend=${encodeURIComponent(state.profile.handle)}`;
    content = (
      <>
        {backHeader("My TAB code")}
        <div className="segmented">
          <button className="active">My code</button>
          <button onClick={() => setModal({ type: "scan" })}>Scan</button>
        </div>
        <div className="code-card">
          <Avatar
            friend={{
              name: state.profile.name,
              color: "lilac",
              status: state.profile.status,
            }}
          />
          <h2>{state.profile.name}</h2>
          <p>@{state.profile.handle}</p>
          <QrImage value={link} />
          <span className="wordmark">tab</span>
        </div>
        <p className="center subheading">
          Friends scan this to find you.
          <br />
          Keep your people close.
        </p>
        <Btn onClick={() => setModal({ type: "scan" })}>
          <Camera size={18} />
          Scan a code
        </Btn>
        <Btn
          secondary
          onClick={() => share("My TAB code", "Add me on TAB", link)}
        >
          <Share2 size={18} />
          Share my link
        </Btn>
      </>
    );
  } else if (route.page === "plans")
    content = (
      <Plans
        state={state}
        friendId={route.id}
        onVenue={(id) => go("venue", id)}
        onNew={() => setModal({ type: "invite", id: "elsewhere" })}
        onRsvp={(id, rsvp) =>
          update((s) => ({
            ...s,
            plans: s.plans.map((p) => (p.id === id ? { ...p, rsvp } : p)),
          }))
        }
      />
    );
  else if (route.page === "social")
    content = (
      <>
        {header(
          "Social",
          <IconBtn label="Your plans" onClick={() => go("plans")}>
            <CalendarDays size={21} />
          </IconBtn>,
        )}
        <Chips
          options={["All", "Invites", "Payments", "Friends"]}
          value={socialFilter}
          onChange={setSocialFilter}
        />
        <div className="results-label">YOUR NIGHT, TOGETHER</div>
        {state.activity.filter(
          (a) => socialFilter === "All" || a.type === socialFilter,
        ).length ? (
          state.activity
            .filter((a) => socialFilter === "All" || a.type === socialFilter)
            .map((a) => (
              <div className="activity" key={a.id}>
                <span
                  className={`activity-icon ${a.type === "Payments" ? "mint" : ""}`}
                >
                  {a.friend && friendById(a.friend) ? (
                    <Avatar friend={friendById(a.friend)} size="small" />
                  ) : a.type === "Payments" ? (
                    <CreditCard />
                  ) : a.type === "Friends" ? (
                    <Users />
                  ) : (
                    <Check />
                  )}
                </span>
                <button
                  className="activity-copy"
                  onClick={() =>
                    go(
                      a.type === "Invites"
                        ? "plans"
                        : a.type === "Payments"
                          ? "history"
                          : a.type === "Orders" && state.tab
                            ? "tab"
                            : "friends",
                    )
                  }
                >
                  <strong>{a.title}</strong>
                  <small>{a.detail}</small>
                </button>
                {a.type === "Invites" ? (
                  <button className="chip selected" onClick={() => go("plans")}>
                    View
                  </button>
                ) : a.amount !== undefined ? (
                  <b>{money(a.amount)}</b>
                ) : null}
              </div>
            ))
        ) : (
          <Empty
            icon={<Users />}
            title="All caught up"
            detail="Your updates will appear here as the night unfolds."
          />
        )}
      </>
    );
  else if (route.page === "tab") {
    const t = state.tab;
    content = t ? (
      <>
        {backHeader()}
        <p className="eyebrow">{venueById(t.venueId).name} · Tonight</p>
        <h1>{t.group ? "Group tab." : "Your tab."}</h1>
        <p className="tab-status">
          <i />
          Open ·{" "}
          {t.group
            ? `${t.members.length + 1} people · you’re hosting`
            : `${t.method} authorized (demo)`}
        </p>
        {t.group && (
          <>
            <div className="group-total">
              <small>RUNNING TOTAL</small>
              <strong>{money(activeTotal)}</strong>
              <span>{t.rounds.length} rounds · all your people, one tab</span>
            </div>
            <div className="segmented">
              {["Pay what you order", "Split evenly"].map((s) => (
                <button
                  key={s}
                  className={t.split === s ? "active" : ""}
                  onClick={() =>
                    update((x) => ({
                      ...x,
                      tab: x.tab ? { ...x.tab, split: s } : null,
                    }))
                  }
                >
                  {s}
                </button>
              ))}
            </div>
            {["you", ...t.members].map((id, i) => {
              const person =
                id === "you"
                  ? { name: "You", color: "blue", status: "" }
                  : friendById(id);
              if (!person) return null;
              const ownRounds = t.rounds.map((r) => ({
                ...r,
                items: r.items.filter((item) => item.owner === id),
              }));
              return (
                <div className="group-person" key={id}>
                  <Avatar friend={person} size="small" />
                  <span>
                    <strong>{person.name}</strong>
                    <small>
                      {id === "you"
                        ? "Host · demo wallet"
                        : "On your shared tab"}
                    </small>
                  </span>
                  <b>
                    {money(
                      t.split === "Split evenly"
                        ? splitCents(activeTotal, t.members.length + 1)[i]
                        : totals(ownRounds).total,
                    )}
                  </b>
                </div>
              );
            })}
            <Btn secondary onClick={() => setModal({ type: "members" })}>
              <Plus size={18} />
              Invite to tab
            </Btn>
          </>
        )}
        {t.rounds.length ? (
          t.rounds.map((r, i) => (
            <div className="round-card" key={r.id}>
              <div>
                <h3>
                  Round {i + 1} — #{r.id}
                </h3>
                <span
                  className={`order-status ${r.status === "Delivered" ? "delivered" : ""}`}
                >
                  {r.status}
                </span>
              </div>
              {r.items.map((item) => (
                <p key={item.key}>
                  <span>
                    {item.name} ×{item.quantity}
                    {t.group && (
                      <small>
                        {" "}
                        ·{" "}
                        {item.owner === "you"
                          ? "You"
                          : friendById(item.owner)?.name}
                      </small>
                    )}
                  </span>
                  <b>{money(item.price * item.quantity)}</b>
                </p>
              ))}
              <button onClick={() => go("order", String(r.id))}>
                Added to your tab
                <span>
                  View order <ChevronRight size={13} />
                </span>
              </button>
            </div>
          ))
        ) : (
          <Empty
            icon={<ReceiptText />}
            title="One tab. All night."
            detail="Your tab is open. Pick something good for your first round."
          />
        )}
        <div className="tab-bottom">
          <Totals rounds={t.rounds} />
          <Btn
            disabled={!canClose(t)}
            onClick={() => {
              setSplitCount(
                t.group && t.split === "Split evenly"
                  ? t.members.length + 1
                  : 1,
              );
              go("checkout");
            }}
          >
            Close my tab
          </Btn>
          <Btn secondary onClick={() => go("venue", t.venueId)}>
            {t.rounds.length ? "Order another round" : "Order your first round"}
          </Btn>
          {!canClose(t) && t.rounds.length > 0 && (
            <p className="demo-note">
              Close your tab once every round is delivered. Open an order to run
              the bartender demo.
            </p>
          )}
          {!t.rounds.length && (
            <button
              className="text-button center-button"
              onClick={() => {
                update((s) => ({ ...s, tab: null }));
                go("home");
                notify("Empty tab closed");
              }}
            >
              Cancel empty tab
            </button>
          )}
          <button className="text-button" onClick={() => go("history")}>
            Payment history <ChevronRight size={14} />
          </button>
        </div>
      </>
    ) : (
      <Empty
        title="No open tab"
        detail="Find a spot and start your next night."
        action="Discover venues"
        onClick={() => go("explore")}
      />
    );
  } else if (route.page === "order") {
    const r = state.tab?.rounds.find((r) => String(r.id) === route.id);
    const t = state.tab;
    const elapsed = r
      ? Math.max(0, Math.floor((clock - r.createdAt) / 1000))
      : 0;
    content =
      r && t ? (
        <div className={`order-screen ${showServer ? "show-server" : ""}`}>
          <div className="order-heading">
            <p className="eyebrow">{venueById(t.venueId).name} · Tonight</p>
            <h1>Your order.</h1>
            <p>
              Round {t.rounds.indexOf(r) + 1} ·{" "}
              {r.status === "Delivered" ? "delivered" : "sent to the bar"}
            </p>
          </div>
          <div className="ticket-stage">
            <div className="order-ticket">
              <div className="ticket-top">
                <span
                  className={`ticket-payment ${r.status === "Ready" || r.status === "Delivered" ? "ready" : ""}`}
                >
                  Tab · {money(totals([r]).total)}
                </span>
                <strong>#{r.id}</strong>
              </div>
              <div className="ticket-items">
                {r.items.map((item) => (
                  <div key={item.key}>
                    <span className="ticket-quantity">×{item.quantity}</span>
                    <h2>{item.name}</h2>
                  </div>
                ))}
              </div>
              <time>
                {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
                {String(elapsed % 60).padStart(2, "0")}
              </time>
            </div>
            {showServer && (
              <span className="server-caption">Showing to bartender</span>
            )}
          </div>
          <div className="order-controls">
            <div className="order-update">
              <span>
                <strong>ORDER {r.status.toUpperCase()}</strong>
                <small>
                  {r.status === "Received"
                    ? "Your demo order was sent to the bar."
                    : r.status === "Ready"
                      ? "Your round is ready. Come say hello."
                      : "Enjoy your round. Here’s to a good night."}
                </small>
              </span>
              <button className="chip" onClick={() => go("tab")}>
                <LogOut size={16} />
                Exit
              </button>
            </div>
            <Btn onClick={() => setShowServer(!showServer)}>
              {showServer ? <ArrowDown size={19} /> : <ArrowUp size={19} />}{" "}
              {showServer ? "Bring back" : "Show server"}
            </Btn>
            <button
              className="demo-control"
              onClick={() => setModal({ type: "bartender", id: String(r.id) })}
            >
              Bartender demo · update order status
            </button>
          </div>
        </div>
      ) : (
        <Empty
          title="This order is in your history"
          detail="Find your receipt to revisit the night."
          action="View history"
          onClick={() => go("history")}
        />
      );
  } else if (route.page === "checkout") {
    const t = state.tab;
    content = t ? (
      <>
        {backHeader()}
        <p className="eyebrow">{venueById(t.venueId).name} · Tonight</p>
        <h1>Close your tab.</h1>
        <div className="panel checkout-rounds">
          {t.rounds.map((r, i) => (
            <div key={r.id}>
              <p>
                <strong>
                  Round {i + 1} — #{r.id}
                </strong>
                <b>{money(subtotal(r.items))}</b>
              </p>
              <small>
                {r.items.map((x) => `${x.name} ×${x.quantity}`).join(", ")}
              </small>
            </div>
          ))}
          <p className="delivered-line">
            <span>All rounds delivered</span>
            <Check size={17} />
          </p>
        </div>
        <p className="eyebrow">Add a tip</p>
        <div className="tip-grid">
          {[18, 20, 25, 0].map((n) => (
            <button
              key={n}
              className={tip === n ? "selected" : ""}
              onClick={() => setTip(n)}
            >
              <strong>{n ? `${n}%` : "None"}</strong>
              <small>{money(totals(t.rounds, n).tip)}</small>
            </button>
          ))}
        </div>
        <p className="demo-note">
          Tips go directly to tonight’s bar staff in the live experience.
        </p>
        <div className="panel">
          <Row
            icon={<Users size={18} />}
            detail={splitCount === 1 ? "Just me" : `${splitCount} people`}
            onClick={() => setModal({ type: "split" })}
          >
            Split with friends
          </Row>
        </div>
        <div className="panel">
          <Row
            icon={<CreditCard size={18} />}
            detail="Change"
            onClick={() => setModal({ type: "changePayment" })}
          >
            {t.method} ···· 4242
          </Row>
        </div>
        <Totals rounds={t.rounds} tip={tip} />
        {splitCount > 1 && (
          <p className="split-summary">
            Your share:{" "}
            {money(splitCents(totals(t.rounds, tip).total, splitCount)[0])} ·
            split {splitCount} ways. Demo host covers the total; no requests are
            sent.
          </p>
        )}
        <Btn onClick={() => setModal({ type: "confirmClose" })}>
          <Lock size={16} />
          Pay {money(totals(t.rounds, tip).total)}
        </Btn>
        <p className="demo-note center">Demo payment · no real charge</p>
      </>
    ) : (
      <Empty
        title="Your tab is closed"
        detail="Thanks for a good night."
        action="Home"
        onClick={() => go("home")}
      />
    );
  } else if (route.page === "receipt") {
    const receipt = state.receipts.find((r) => r.id === route.id);
    content = receipt ? (
      <>
        {backHeader()}
        <div className="receipt-heading">
          <span className="success-ring">
            <Check size={38} />
          </span>
          <h1>
            {receipt.covered
              ? `You covered ${receipt.covered}’s tab.`
              : "Tab closed."}
          </h1>
          <p>{venueById(receipt.venueId).name} · Brooklyn, NY</p>
          <small>
            {new Date(receipt.createdAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </small>
        </div>
        <div className="panel receipt-panel">
          {receipt.rounds
            .flatMap((r) => r.items)
            .map((item) => (
              <p key={item.key}>
                <span>
                  {item.name} ×{item.quantity}
                </span>
                <b>{money(item.price * item.quantity)}</b>
              </p>
            ))}
          <Totals rounds={receipt.rounds} tip={receipt.tipPercent} paid />
          <div className="receipt-meta">
            <span>{receipt.method} ···· 4242</span>
            <span>Demo receipt</span>
          </div>
        </div>
        <div className="rating">
          <p className="eyebrow">How was your night?</p>
          <div>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                aria-label={`Rate ${n} stars`}
                key={n}
                onClick={() =>
                  update((s) => ({
                    ...s,
                    receipts: s.receipts.map((r) =>
                      r.id === receipt.id ? { ...r, rating: n } : r,
                    ),
                  }))
                }
              >
                <Star
                  size={31}
                  fill={receipt.rating >= n ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <Row
            icon={
              <Heart
                fill={
                  state.favorites.includes(receipt.venueId)
                    ? "currentColor"
                    : "none"
                }
              />
            }
            onClick={() => favorite(receipt.venueId)}
          >
            {state.favorites.includes(receipt.venueId)
              ? "Saved to favorites"
              : `Save ${venueById(receipt.venueId).name} to favorites`}
          </Row>
        </div>
        <Btn onClick={() => go("story", receipt.venueId)}>
          <Share2 size={18} />
          Share to story
        </Btn>
        <Btn secondary onClick={() => go("home")}>
          Done
        </Btn>
      </>
    ) : (
      <Empty
        title="Receipt not found"
        detail="Your completed tabs appear in history."
        action="View history"
        onClick={() => go("history")}
      />
    );
  } else if (route.page === "history")
    content = (
      <>
        {header("Your nights")}
        <p className="subheading">Good memories. Everything accounted for.</p>
        {state.receipts.length ? (
          state.receipts.map((r) => (
            <ReceiptRow
              key={r.id}
              receipt={r}
              onClick={() => go("receipt", r.id)}
            />
          ))
        ) : (
          <Empty
            icon={<ReceiptText />}
            title="A clean slate"
            detail="When you close a tab, your itemized receipt will appear here."
            action="Find your night"
            onClick={() => go("explore")}
          />
        )}
      </>
    );
  else if (route.page === "story")
    content = (
      <div className={`story ${currentVenue.mood}`}>
        <div className="story-top">
          <IconBtn label="Close story" onClick={back}>
            <X size={20} />
          </IconBtn>
          <IconBtn
            label="Share story"
            onClick={() =>
              share(
                `TAB at ${currentVenue.name}`,
                `Meet me at ${currentVenue.name}. Good people. Great nights.`,
                `${location.origin}${location.pathname}?venue=${currentVenue.id}`,
              )
            }
          >
            <Share2 size={20} />
          </IconBtn>
        </div>
        <div className="story-brand">
          <span className="wordmark">tab</span>
          <span>
            GOOD
            <br />
            PEOPLE
            <br />
            GREAT
            <br />
            NIGHTS
          </span>
        </div>
        <div className="story-orb" />
        <div className="story-text">
          <p className="eyebrow">At</p>
          <h1>{currentVenue.name}</h1>
          <p>{currentVenue.area}</p>
          <div className="meet-me">
            <small>Tonight</small>
            <strong>Meet me here</strong>
          </div>
        </div>
        <div className="story-footer">
          SHARED FROM TAB{" "}
          <span>
            SAME NIGHTS
            <br />
            BRIGHTER PEOPLE
          </span>
        </div>
        <Btn
          onClick={() =>
            share(
              `TAB at ${currentVenue.name}`,
              `Meet me at ${currentVenue.name}`,
              `${location.origin}${location.pathname}?venue=${currentVenue.id}`,
            )
          }
        >
          <Share2 size={18} />
          Share this night
        </Btn>
      </div>
    );
  else if (route.page === "cards")
    content = (
      <>
        {backHeader("Payment methods")}
        <div className="wallet-card">
          <CreditCard size={28} />
          <span>DEMO WALLET</span>
          <h2>•••• &nbsp; •••• &nbsp; •••• &nbsp;4242</h2>
          <p>{state.profile.name.toUpperCase()}</p>
        </div>
        <h2>Your night, one payment.</h2>
        <p className="subheading">
          Apple Pay, Google Pay, and card flows are simulated in this app. No
          card details are collected or stored.
        </p>
        <div className="panel">
          {["Apple Pay", "Google Pay", "Demo card"].map((m) => (
            <Row
              key={m}
              icon={<CreditCard />}
              detail="Demo"
              onClick={() => notify(`${m} is available when you open a tab`)}
            >
              {m}
            </Row>
          ))}
        </div>
      </>
    );
  else if (route.page === "settings")
    content = (
      <>
        {backHeader("Settings")}
        <h2>Made for the whole night.</h2>
        <p className="subheading">TAB by OrangeTower Analytics.</p>
        <div className="panel">
          <Row
            icon={<Pencil />}
            onClick={() => setModal({ type: "editProfile" })}
          >
            Edit profile
          </Row>
          <Row icon={<ReceiptText />} onClick={() => go("history")}>
            Payment history
          </Row>
          <Row icon={<Sparkles />} onClick={() => setModal({ type: "about" })}>
            About this demo
          </Row>
          <Row icon={<X />} danger onClick={() => setModal({ type: "reset" })}>
            Reset demo data
          </Row>
        </div>
        <p className="demo-note">
          Your data stays in this browser. This prototype has no live venue
          connection, shared accounts, or payment processing.
        </p>
        <p className="demo-note">
          On iPhone: open in Safari, tap Share, then Add to Home Screen for the
          app experience.
        </p>
      </>
    );
  else content = null;
  return (
    <div className="app-shell">
      <aside className="desktop-side">
        <div className="wordmark">
          tab{" "}
          <span className="brand-dots">
            <i />
            <i />
          </span>
        </div>
        <div className="side-copy">
          <p className="eyebrow">GOOD PEOPLE. GREAT NIGHTS.</p>
          <h2>
            The night is
            <br />
            better together.
          </h2>
          <p>
            Find your spot.
            <br />
            Bring your people.
            <br />
            We’ll keep the tab.
          </p>
        </div>
        <div className="side-bottom">
          <span>AN ORANGETOWER ANALYTICS APP</span>
          <button onClick={() => setModal({ type: "about" })}>
            Interactive demo <ExternalLink size={13} />
          </button>
        </div>
      </aside>
      <div
        className={`mobile-shell ${route.page === "order" ? "order-shell" : ""}`}
      >
        <main
          ref={mainRef}
          className={`main page-${route.page}`}
          key={`${route.page}-${route.id || ""}`}
        >
          {storageError && (
            <div className="storage-warning">
              Browser storage is unavailable. Changes will last only for this
              session.
            </div>
          )}
          {content}
        </main>
        {route.page !== "order" && (
          <nav className="bottom-nav" aria-label="Main navigation">
            {[
              { id: "home", label: "Home", icon: <Home /> },
              { id: "explore", label: "Explore", icon: <Search /> },
              { id: "scan", label: "Scan", icon: <QrCode /> },
              { id: "social", label: "Social", icon: <Users /> },
              { id: "profile", label: "Profile", icon: <UserRound /> },
            ].map((n) => (
              <button
                key={n.id}
                className={`${navActive === n.id ? "active" : ""} ${n.id === "scan" ? "nav-scan" : ""}`}
                onClick={() =>
                  n.id === "scan" ? setModal({ type: "scan" }) : go(n.id)
                }
                aria-label={n.id === "scan" ? "Scan a TAB code" : n.label}
                aria-current={navActive === n.id ? "page" : undefined}
              >
                {n.icon}
                {n.id !== "scan" && <span>{n.label}</span>}
              </button>
            ))}
          </nav>
        )}
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {modal && (
        <ModalContent
          key={modal.type}
          modal={modal}
          close={() => setModal(null)}
          setModal={setModal}
          state={state}
          update={update}
          notify={notify}
          go={go}
          authorize={authorize}
          submitRound={submitRound}
          closeTab={closeTab}
          tip={tip}
          splitCount={splitCount}
          setSplitCount={setSplitCount}
        />
      )}
    </div>
  );
}
function Totals({
  rounds,
  tip,
  paid = false,
}: {
  rounds: Round[];
  tip?: number;
  paid?: boolean;
}) {
  const t = totals(rounds, tip || 0);
  return (
    <div className="totals">
      <p>
        <span>Subtotal</span>
        <span>{money(t.subtotal)}</span>
      </p>
      <p>
        <span>Tax</span>
        <span>{money(t.tax)}</span>
      </p>
      {tip !== undefined && (
        <p>
          <span>Tip ({tip}%)</span>
          <span>{money(t.tip)}</span>
        </p>
      )}
      <p className="total">
        <strong>
          {paid ? "Total paid" : tip !== undefined ? "Total" : "Current total"}
        </strong>
        <b>{money(t.total)}</b>
      </p>
    </div>
  );
}
function ReceiptRow({
  receipt,
  onClick,
}: {
  receipt: Receipt;
  onClick: () => void;
}) {
  return (
    <button className="history-row" onClick={onClick}>
      <span className="history-icon">
        <ReceiptText size={23} />
      </span>
      <span>
        <strong>{venueById(receipt.venueId).name}</strong>
        <small>
          {new Date(receipt.createdAt).toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })}{" "}
          · {receipt.rounds.length} rounds
        </small>
      </span>
      <b>{money(totals(receipt.rounds, receipt.tipPercent).total)}</b>
    </button>
  );
}
function DrinkView({
  drink,
  venue,
  state,
  back,
  add,
}: {
  drink: Drink;
  venue: Venue;
  state: State;
  back: () => void;
  add: (i: Item) => void;
}) {
  const [rim, setRim] = useState("Salt");
  const [ice, setIce] = useState("Regular");
  const [style, setStyle] = useState("Classic");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [owner, setOwner] = useState("you");
  const cocktail = drink.category === "Cocktails";
  const price = drink.price + (style === "Spicy +$1" ? 100 : 0);
  return (
    <>
      <div className={`drink-hero ${drink.color}`}>
        <IconBtn label="Go back" onClick={back}>
          <ArrowLeft size={20} />
        </IconBtn>
        <Martini className="drink-hero-icon" strokeWidth={1} />
        <span>MAKE IT YOURS</span>
      </div>
      <p className="eyebrow">
        {drink.category} · {venue.name}
      </p>
      <div className="drink-title">
        <h1>{drink.name}</h1>
        <strong>{money(price).replace(".00", "")}</strong>
      </div>
      <p className="subheading">{drink.description}</p>
      {cocktail && (
        <>
          <p className="eyebrow">Rim</p>
          <Chips
            options={["Salt", "Tajín", "None"]}
            value={rim}
            onChange={setRim}
          />
          <p className="eyebrow">Ice</p>
          <Chips
            options={["Regular", "Light", "Neat"]}
            value={ice}
            onChange={setIce}
          />
          <p className="eyebrow">Make it</p>
          <Chips
            options={["Classic", "Spicy +$1", "Zero-proof"]}
            value={style}
            onChange={setStyle}
          />
        </>
      )}
      <label className="field-label" htmlFor="drink-note">
        Note for the bartender
      </label>
      <input
        id="drink-note"
        maxLength={150}
        placeholder="Add a note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {state.tab?.group && (
        <>
          <label className="field-label" htmlFor="drink-owner">
            Ordering for
          </label>
          <select
            id="drink-owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option value="you">You</option>
            {state.tab.members.map((id) => (
              <option key={id} value={id}>
                {state.friends.find((f) => f.id === id)?.name || id}
              </option>
            ))}
          </select>
        </>
      )}
      <div className="round-context">
        <ReceiptText size={23} />
        <span>
          <strong>Round {(state.tab?.rounds.length || 0) + 1}</strong>
          <small>
            {state.cart.reduce((s, i) => s + i.quantity, 0)} drinks already in
            this round
          </small>
        </span>
      </div>
      <div className="add-drink-row">
        <div className="quantity">
          <button
            aria-label="Decrease quantity"
            disabled={quantity === 1}
            onClick={() => setQuantity((n) => n - 1)}
          >
            <Minus size={17} />
          </button>
          <strong>{quantity}</strong>
          <button
            aria-label="Increase quantity"
            disabled={quantity === 20}
            onClick={() => setQuantity((n) => n + 1)}
          >
            <Plus size={17} />
          </button>
        </div>
        <Btn
          onClick={() =>
            add({
              key: crypto.randomUUID(),
              drinkId: drink.id,
              name: drink.name,
              price,
              quantity,
              rim: cocktail ? rim : "",
              ice: cocktail ? ice : "",
              style: cocktail ? style : "",
              note,
              owner,
            })
          }
        >
          Add to round · {money(price * quantity)}
        </Btn>
      </div>
    </>
  );
}
function Plans({
  state,
  friendId,
  onVenue,
  onNew,
  onRsvp,
}: {
  state: State;
  friendId?: string;
  onVenue: (s: string) => void;
  onNew: () => void;
  onRsvp: (id: string, r: string) => void;
}) {
  const [view, setView] = useState("Upcoming");
  const plans = state.plans.filter(
    (p) =>
      (!friendId || p.friends.includes(friendId)) &&
      (view === "Upcoming"
        ? new Date(`${p.date}T${p.time}`).getTime() >= Date.now() - 86400000
        : new Date(`${p.date}T${p.time}`).getTime() < Date.now() - 86400000),
  );
  return (
    <>
      <div className="page-header">
        <h1>Plans</h1>
        <IconBtn label="Create a plan" className="purple" onClick={onNew}>
          <Plus />
        </IconBtn>
      </div>
      <p className="subheading">
        {plans.length} {view.toLowerCase()}
        {friendId ? " together" : ""}
      </p>
      <div className="segmented">
        {["Upcoming", "Past"].map((v) => (
          <button
            key={v}
            className={v === view ? "active" : ""}
            onClick={() => setView(v)}
          >
            {v}
          </button>
        ))}
      </div>
      {plans.map((p) => (
        <div
          className={`plan-card ${p.rsvp === "Going" ? "going" : ""}`}
          key={p.id}
        >
          <p className="eyebrow">
            {new Date(`${p.date}T${p.time}`).toLocaleString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <button className="plan-venue" onClick={() => onVenue(p.venueId)}>
            <h2>{venueById(p.venueId).name}</h2>
            <ChevronRight size={20} />
          </button>
          <p>
            {venueById(p.venueId).area} · {venueById(p.venueId).tags[0]}
          </p>
          <div className="plan-friends">
            <div className="avatar-stack">
              {p.friends
                .map((id) => state.friends.find((f) => f.id === id))
                .filter(Boolean)
                .map((f) => (
                  <Avatar key={f!.id} friend={f!} size="tiny" />
                ))}
            </div>
            <small>
              {p.friends.length + 1} invited ·{" "}
              {p.rsvp === "Invited"
                ? "You’re invited"
                : p.rsvp === "Going"
                  ? "You’re going"
                  : p.rsvp}
            </small>
          </div>
          {p.note && <p className="plan-note">{p.note}</p>}
          {view === "Upcoming" && (
            <div className="rsvp">
              {(p.rsvp === "Invited"
                ? ["Accept", "Decline"]
                : ["Going", "Maybe", "Can’t"]
              ).map((r) => (
                <button
                  key={r}
                  className={r === p.rsvp || r === "Accept" ? "selected" : ""}
                  onClick={() =>
                    onRsvp(
                      p.id,
                      r === "Accept"
                        ? "Going"
                        : r === "Decline"
                          ? "Declined"
                          : r,
                    )
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      {!plans.length && (
        <Empty
          icon={<CalendarDays />}
          title={
            view === "Past" ? "The best is still ahead" : "Make a night of it"
          }
          detail="Choose a spot and bring your people together."
          action="Make a plan"
          onClick={onNew}
        />
      )}
    </>
  );
}
type ModalProps = {
  modal: Modal;
  close: () => void;
  setModal: (m: Modal | null) => void;
  state: State;
  update: (fn: (s: State) => State) => void;
  notify: (m: string) => void;
  go: (p: string, id?: string) => void;
  authorize: (method: string, group: boolean) => void;
  submitRound: () => void;
  closeTab: () => void;
  tip: number;
  splitCount: number;
  setSplitCount: (n: number) => void;
};
function ModalContent(props: ModalProps) {
  const {
    modal,
    close,
    setModal,
    state,
    update,
    notify,
    go,
    authorize,
    submitRound,
    closeTab,
    tip,
    splitCount,
    setSplitCount,
  } = props;
  const [group, setGroup] = useState(false);
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState("Apple Pay");
  const [selected, setSelected] = useState<string[]>(
    modal.type === "members" ? state.tab?.members || [] : [],
  );
  const [venueId, setVenueId] = useState(
    modal.id && venues.some((v) => v.id === modal.id) ? modal.id : "elsewhere",
  );
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [time, setTime] = useState("21:00");
  const [note, setNote] = useState("");
  const [name, setName] = useState(state.profile.name);
  const [handle, setHandle] = useState(state.profile.handle);
  const [bio, setBio] = useState(state.profile.bio);
  const [friendName, setFriendName] = useState("");
  const [error, setError] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    prevFocus.current = document.activeElement as HTMLElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      prevFocus.current?.focus();
    };
  }, []);
  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  const f = state.friends.find((f) => f.id === modal.id);
  let title = "";
  let body: ReactNode;
  if (modal.type === "open") {
    title =
      step === 0
        ? "Open a tab"
        : step === 1
          ? "Open your tab"
          : `${method} demo`;
    body =
      step === 0 ? (
        <>
          <h2>Who’s on this tab?</h2>
          <p className="subheading">
            {venueById(modal.id).name} · Brooklyn, NY
          </p>
          {[
            {
              value: false,
              icon: <UserRound />,
              title: "Just me",
              text: "Your own tab. Every round you order goes on it, and you pay once when you leave.",
            },
            {
              value: true,
              icon: <Users />,
              title: "Group tab",
              text: "One shared tab for the table. Track everyone’s orders or split the total evenly.",
            },
          ].map((o) => (
            <button
              key={o.title}
              className={`tab-choice ${group === o.value ? "selected" : ""}`}
              onClick={() => setGroup(o.value)}
            >
              <span>{o.icon}</span>
              <div>
                <h3>{o.title}</h3>
                <p>{o.text}</p>
                {o.value && (
                  <small>Invite friends after opening your tab</small>
                )}
              </div>
              <span className="radio">
                {group === o.value && <Check size={13} />}
              </span>
            </button>
          ))}
          <Btn onClick={() => setStep(1)}>Open {group ? "our" : "my"} tab</Btn>
          <p className="secure-note">
            <Lock size={12} />
            Nothing charged until you close out
          </p>
        </>
      ) : step === 1 ? (
        <>
          <span className="square-icon">
            <ReceiptText />
          </span>
          <h2>One tab. All night.</h2>
          <p className="subheading">
            Authorize a payment method once. Every round goes on your tab, and
            you pay when you close out.
          </p>
          {state.cart.length > 0 && (
            <div className="notice">
              Your selected round is saved and will be sent after authorization.
            </div>
          )}
          <Btn
            className="apple-pay"
            onClick={() => {
              setMethod("Apple Pay");
              setStep(2);
            }}
          >
            Pay with Apple Pay
          </Btn>
          <div className="two-col">
            <Btn
              secondary
              onClick={() => {
                setMethod("Google Pay");
                setStep(2);
              }}
            >
              Google Pay
            </Btn>
            <Btn
              secondary
              onClick={() => {
                setMethod("Card");
                setStep(2);
              }}
            >
              <CreditCard size={17} />
              Card
            </Btn>
          </div>
          <p className="secure-note">
            <Lock size={12} />
            Nothing charged now · demo mode
          </p>
        </>
      ) : (
        <>
          <div className="payment-brand">
            <h2>{method}</h2>
            <span className="demo-pill">DEMO</span>
          </div>
          <div className="payment-venue">
            <span className="square-icon wordmark">tab</span>
            <div>
              <strong>{venueById(modal.id).name}</strong>
              <small>TAB · Brooklyn, NY</small>
            </div>
            <Check size={18} />
          </div>
          <div className="demo-card">
            <CreditCard />
            <span>
              <strong>Demo card</strong>
              <small>•••• 4242</small>
            </span>
            <small>SIMULATED</small>
          </div>
          <p className="subheading">
            You’ll review the total and confirm one payment at the end of the
            night.
          </p>
          <div className="due-now">
            <span>Due now</span>
            <strong>$0.00</strong>
          </div>
          <Btn onClick={() => authorize(method, group)}>
            <Lock size={16} />
            Authorize & open tab
          </Btn>
          <p className="secure-note">
            Simulation only. No real authorization or charge.
          </p>
        </>
      );
  } else if (modal.type === "round") {
    title = "Your next round";
    body = (
      <>
        {state.cart.length ? (
          <>
            <p className="subheading">
              {venueById(state.cartVenue || undefined).name} · Round{" "}
              {(state.tab?.rounds.length || 0) + 1}
            </p>
            {state.cart.map((item) => (
              <div className="cart-item" key={item.key}>
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {[item.rim, item.ice, item.style]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                  {item.note && <small>“{item.note}”</small>}
                  <b>{money(item.price * item.quantity)}</b>
                </div>
                <div className="quantity">
                  <button
                    aria-label={`Remove one ${item.name}`}
                    onClick={() =>
                      update((s) => ({
                        ...s,
                        cart: s.cart.flatMap((i) =>
                          i.key !== item.key
                            ? [i]
                            : i.quantity > 1
                              ? [{ ...i, quantity: i.quantity - 1 }]
                              : [],
                        ),
                      }))
                    }
                  >
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    aria-label={`Add one ${item.name}`}
                    disabled={item.quantity >= 20}
                    onClick={() =>
                      update((s) => ({
                        ...s,
                        cart: s.cart.map((i) =>
                          i.key === item.key
                            ? { ...i, quantity: i.quantity + 1 }
                            : i,
                        ),
                      }))
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
            <div className="due-now">
              <span>Round subtotal</span>
              <strong>{money(subtotal(state.cart))}</strong>
            </div>
            <p className="demo-note">
              Tax is added to your tab. Choose a tip when you close out.
            </p>
            <Btn onClick={submitRound}>
              {state.tab ? "Send round to the bar" : "Open tab & send round"}
              <Send size={17} />
            </Btn>
            <Btn secondary onClick={close}>
              Keep browsing
            </Btn>
          </>
        ) : (
          <Empty
            title="An empty round"
            detail="Pick something from the menu to get started."
            action="Back to menu"
            onClick={close}
          />
        )}
      </>
    );
  } else if (modal.type === "invite") {
    title = "Invite friends";
    body = (
      <>
        <label className="field-label" htmlFor="plan-venue">
          The spot
        </label>
        <select
          id="plan-venue"
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
        >
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <div className="two-col">
          <label className="form-label">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="form-label">
            Time
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
        </div>
        <h3>Who’s coming?</h3>
        <div className="invite-list">
          {state.friends.map((f) => (
            <button key={f.id} onClick={() => toggle(f.id)}>
              <span
                className={`checkbox ${selected.includes(f.id) ? "checked" : ""}`}
              >
                {selected.includes(f.id) && <Check size={15} />}
              </span>
              <Avatar friend={f} size="small" />
              <span>
                <strong>{f.name}</strong>
                <small>{f.status}</small>
              </span>
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="invite-note">
          Add a note
        </label>
        <input
          id="invite-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={100}
          placeholder="Add a note (optional)"
        />
        <span className="character-count">{note.length}/100</span>
        {error && <p className="form-error">{error}</p>}
        <Btn
          onClick={() => {
            if (
              !date ||
              !time ||
              new Date(`${date}T${time}`).getTime() < Date.now()
            ) {
              setError("Choose a future date and time.");
              return;
            }
            if (!selected.length) {
              setError("Choose at least one friend.");
              return;
            }
            const plan = {
              id: crypto.randomUUID(),
              venueId,
              date,
              time,
              friends: selected,
              note,
              rsvp: "Going",
            };
            update((s) => ({
              ...s,
              plans: [plan, ...s.plans],
              activity: [
                {
                  id: crypto.randomUUID(),
                  type: "Invites",
                  title: `You planned a night at ${venueById(venueId).name}`,
                  detail: `${selected.length} friends invited · demo plan`,
                },
                ...s.activity,
              ],
            }));
            go("plans");
            notify("Plan saved · demo invitations added");
          }}
        >
          <Send size={17} />
          Send invite
        </Btn>
        <p className="demo-note center">
          Saved in this demo. No real messages are sent.
        </p>
      </>
    );
  } else if (modal.type === "members") {
    title = "Your group tab";
    body = (
      <>
        <p className="subheading">
          Add people to your demo tab. You can assign drinks to them when
          ordering.
        </p>
        <div className="invite-list">
          {state.friends.map((f) => {
            const hasOrders = state.tab?.rounds.some((r) =>
              r.items.some((i) => i.owner === f.id),
            );
            return (
              <button
                key={f.id}
                onClick={() => {
                  if (selected.includes(f.id) && hasOrders) {
                    notify("Keep members who have orders on this tab.");
                    return;
                  }
                  toggle(f.id);
                }}
              >
                <span
                  className={`checkbox ${selected.includes(f.id) ? "checked" : ""}`}
                >
                  {selected.includes(f.id) && <Check size={15} />}
                </span>
                <Avatar friend={f} size="small" />
                <strong>{f.name}</strong>
                {hasOrders && <small>Has orders</small>}
              </button>
            );
          })}
        </div>
        <Btn
          onClick={() => {
            update((s) => ({
              ...s,
              tab: s.tab ? { ...s.tab, members: selected, group: true } : null,
            }));
            close();
            notify("Group tab updated");
          }}
        >
          Save group · {selected.length + 1} people
        </Btn>
      </>
    );
  } else if (modal.type === "bartender") {
    title = "Bartender demo";
    const round = state.tab?.rounds.find((r) => String(r.id) === modal.id);
    body = (
      <>
        <p className="subheading">
          Simulate what the venue sends back for order #{modal.id}. This app is
          not connected to a live bar.
        </p>
        <div className="status-progress">
          {["Received", "Ready", "Delivered"].map((s, i) => (
            <span
              className={
                round &&
                ["Received", "Ready", "Delivered"].indexOf(round.status) >= i
                  ? "done"
                  : ""
              }
              key={s}
            >
              <Check size={14} />
              {s}
            </span>
          ))}
        </div>
        {round?.items.map((item) => (
          <div className="bartender-item" key={item.key}>
            <strong>
              {item.name} ×{item.quantity}
            </strong>
            <small>
              {[item.rim, item.ice, item.style, item.note]
                .filter(Boolean)
                .join(" · ")}
            </small>
          </div>
        ))}
        <Btn
          disabled={round?.status === "Delivered"}
          onClick={() => {
            const next = round?.status === "Received" ? "Ready" : "Delivered";
            update((s) => ({
              ...s,
              tab: s.tab
                ? {
                    ...s.tab,
                    rounds: s.tab.rounds.map((r) =>
                      String(r.id) === modal.id ? { ...r, status: next } : r,
                    ),
                  }
                : null,
              activity: [
                {
                  id: crypto.randomUUID(),
                  type: "Orders",
                  title: `Order #${modal.id} ${next.toLowerCase()}`,
                  detail:
                    next === "Ready"
                      ? "Pick up your round at the bar"
                      : "Your drinks have been delivered",
                },
                ...s.activity,
              ],
            }));
            notify(`Order #${modal.id} ${next.toLowerCase()}`);
            if (next === "Delivered") close();
          }}
        >
          {round?.status === "Received"
            ? "Mark ready for pickup"
            : round?.status === "Ready"
              ? "Mark delivered"
              : "Order delivered"}
        </Btn>
      </>
    );
  } else if (modal.type === "split") {
    title = "Split with friends";
    body = (
      <>
        <p className="subheading">
          Split the total evenly. Any leftover cent goes to the first share.
        </p>
        <div className="split-stepper quantity">
          <button
            aria-label="Fewer people"
            disabled={splitCount <= 1}
            onClick={() => setSplitCount(splitCount - 1)}
          >
            <Minus />
          </button>
          <strong>
            {splitCount} {splitCount === 1 ? "person" : "people"}
          </strong>
          <button
            aria-label="More people"
            disabled={splitCount >= 20}
            onClick={() => setSplitCount(splitCount + 1)}
          >
            <Plus />
          </button>
        </div>
        {state.tab && (
          <div className="due-now">
            <span>Your share</span>
            <strong>
              {money(
                splitCents(totals(state.tab.rounds, tip).total, splitCount)[0],
              )}
            </strong>
          </div>
        )}
        <p className="demo-note">
          The demo host covers the total. Split requests aren’t sent to real
          people.
        </p>
        <Btn onClick={close}>Save split</Btn>
      </>
    );
  } else if (modal.type === "changePayment") {
    title = "Payment method";
    body = (
      <>
        <p className="subheading">Choose a simulated payment method.</p>
        {["Apple Pay", "Google Pay", "Card"].map((m) => (
          <Row
            key={m}
            icon={<CreditCard />}
            detail={state.tab?.method === m ? "Selected" : "Demo"}
            onClick={() => {
              update((s) => ({
                ...s,
                tab: s.tab ? { ...s.tab, method: m } : null,
              }));
              close();
            }}
          >
            {m}
          </Row>
        ))}
      </>
    );
  } else if (modal.type === "confirmClose") {
    title = "One last thing";
    body = (
      <>
        <h2>Ready to close out?</h2>
        <p className="subheading">
          Your receipt will be saved and this tab will close.
        </p>
        {state.tab && <Totals rounds={state.tab.rounds} tip={tip} />}
        <Btn disabled={!canClose(state.tab)} onClick={closeTab}>
          <Lock size={16} />
          Confirm demo payment
        </Btn>
        <Btn secondary onClick={close}>
          Keep tab open
        </Btn>
        <p className="demo-note center">No real payment will be made.</p>
      </>
    );
  } else if (modal.type === "addFriend") {
    title = "Add a friend";
    body = (
      <>
        <p className="subheading">
          Add someone to your demo circle, or scan a friend’s TAB code.
        </p>
        <label className="field-label" htmlFor="friend-name">
          Name
        </label>
        <input
          id="friend-name"
          value={friendName}
          onChange={(e) => setFriendName(e.target.value)}
          maxLength={30}
          placeholder="Your friend’s name"
        />
        {error && <p className="form-error">{error}</p>}
        <Btn
          onClick={() => {
            if (!friendName.trim()) {
              setError("Enter a name first.");
              return;
            }
            const id = crypto.randomUUID();
            update((s) => ({
              ...s,
              friends: [
                ...s.friends,
                {
                  id,
                  name: friendName.trim(),
                  handle: friendName.trim().toLowerCase().replace(/\s+/g, ""),
                  color: ["lilac", "mint", "peach", "blue"][
                    s.friends.length % 4
                  ],
                  status: "Open to suggestions",
                },
              ],
            }));
            go("friend", id);
            notify("Friend added to your demo circle");
          }}
        >
          <Plus size={18} />
          Add friend
        </Btn>
        <Btn secondary onClick={() => setModal({ type: "scan" })}>
          <QrCode size={18} />
          Scan a TAB code
        </Btn>
      </>
    );
  } else if (modal.type === "editProfile") {
    title = "Make it yours";
    body = (
      <>
        <label className="form-label">
          Name
          <input
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="form-label">
          Handle
          <input
            value={handle}
            maxLength={24}
            onChange={(e) =>
              setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
            }
          />
        </label>
        <label className="form-label">
          A little about you
          <textarea
            maxLength={100}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <Btn
          onClick={() => {
            if (!name.trim() || !handle.trim()) {
              setError("Add a name and handle.");
              return;
            }
            update((s) => ({
              ...s,
              profile: {
                ...s.profile,
                name: name.trim(),
                handle: handle.trim(),
                bio: bio.trim(),
              },
            }));
            close();
            notify("Profile updated");
          }}
        >
          Save profile
        </Btn>
      </>
    );
  } else if (modal.type === "removeFriend") {
    title = `Remove ${f?.name || "friend"}?`;
    body = (
      <>
        <p className="subheading">
          They’ll be removed from your circle in this demo.
        </p>
        <Btn
          onClick={() => {
            if (state.tab?.members.includes(modal.id!)) {
              notify("Close your shared tab before removing this friend.");
              return;
            }
            update((s) => ({
              ...s,
              friends: s.friends.filter((x) => x.id !== modal.id),
            }));
            go("friends");
            notify("Friend removed");
          }}
        >
          Remove friend
        </Btn>
        <Btn secondary onClick={close}>
          Keep friend
        </Btn>
      </>
    );
  } else if (modal.type === "cover") {
    title = `Pay ${f?.name || "friend"}’s tab`;
    const sampleItems: Item[] = [
      {
        key: "covered-item",
        drinkId: "cocktails",
        name: "Cocktail round",
        quantity: 1,
        price: 4300,
        rim: "",
        ice: "",
        style: "",
        note: "",
        owner: modal.id!,
      },
    ];
    const sampleRound: Round = {
      id: 46,
      createdAt: Date.now(),
      status: "Delivered",
      items: sampleItems,
    };
    const total = totals([sampleRound]).total;
    body = (
      <>
        <div className="payment-venue">
          <span className="drink-thumb blue">
            <Martini />
          </span>
          <div>
            <strong>Elsewhere</strong>
            <small>Brooklyn, NY</small>
          </div>
        </div>
        <div className="panel cover-panel">
          <p>
            <span>Current balance</span>
            <b>{money(total)}</b>
          </p>
          <p>
            <span>Ordered by</span>
            <b>{f?.name}</b>
          </p>
          <div className="due-now">
            <strong>You’ll pay</strong>
            <strong>{money(total)}</strong>
          </div>
        </div>
        <p className="subheading">A round on you. That’s a good friend.</p>
        <Btn
          onClick={() => {
            const r: Receipt = {
              id: crypto.randomUUID(),
              venueId: "elsewhere",
              rounds: [sampleRound],
              createdAt: Date.now(),
              tipPercent: 0,
              method: "Demo card",
              rating: 0,
              splitCount: 1,
              covered: f?.name,
            };
            update((s) => ({
              ...s,
              receipts: [r, ...s.receipts],
              activity: [
                {
                  id: crypto.randomUUID(),
                  type: "Payments",
                  title: `You covered ${f?.name}’s tab`,
                  detail: "Elsewhere · demo payment",
                  amount: total,
                },
                ...s.activity,
              ],
            }));
            go("receipt", r.id);
          }}
        >
          Pay {money(total)} · demo
        </Btn>
        <p className="secure-note">
          Sample balance. No real charge or notification.
        </p>
      </>
    );
  } else if (modal.type === "reset") {
    title = "Start a fresh night?";
    body = (
      <>
        <p className="subheading">
          This clears your local tabs, receipts, profile changes, and plans,
          then restores the sample data.
        </p>
        <Btn
          onClick={() => {
            update(() => structuredClone(initialState));
            go("home");
            notify("Demo reset");
          }}
        >
          Reset demo data
        </Btn>
        <Btn secondary onClick={close}>
          Keep my data
        </Btn>
      </>
    );
  } else if (modal.type === "scan") {
    title = "Scan a TAB code";
    body = (
      <Scanner
        onCode={(raw) => {
          try {
            const u = new URL(raw);
            const id = u.searchParams.get("venue");
            const friend = u.searchParams.get("friend");
            if (id && venues.some((v) => v.id === id)) {
              go("venue", id);
              notify("Venue found");
              return;
            }
            if (friend) {
              const found = state.friends.find((f) => f.handle === friend);
              if (found) {
                go("friend", found.id);
                return;
              }
              const fid = crypto.randomUUID();
              update((s) => ({
                ...s,
                friends: [
                  ...s.friends,
                  {
                    id: fid,
                    name: friend.slice(0, 30),
                    handle: friend.slice(0, 24),
                    color: "lilac",
                    status: "Open to suggestions",
                  },
                ],
              }));
              go("friend", fid);
              notify("Friend added to your demo circle");
              return;
            }
            notify("This isn’t a recognized TAB code.");
          } catch {
            notify("Try a TAB venue or friend code.");
          }
        }}
        demo={() => {
          go("venue", "house-of-yes");
          notify("Sample code scanned: House of Yes");
        }}
      />
    );
  } else {
    title = "Welcome to TAB";
    body = (
      <>
        <div className="about-mark wordmark">
          tab{" "}
          <span className="brand-dots">
            <i />
            <i />
          </span>
        </div>
        <h2>Good people. Great nights.</h2>
        <p className="subheading">
          An interactive prototype by OrangeTower Analytics, built around your
          whole night out.
        </p>
        <div className="notice">
          This is a demo. Orders, invitations, friends, and payments are
          simulated. Your activity is saved only in this browser.
        </div>
        <p className="subheading">
          To try a full night: choose a venue, customize a drink, send a round,
          open the bartender demo to mark it delivered, then close your tab.
        </p>
        <Btn onClick={close}>Let’s go</Btn>
      </>
    );
  }
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={`modal-sheet modal-${modal.type}`}
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          const els = panel.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled),input,select,textarea,[tabindex="0"]',
          );
          if (!els?.length) return;
          const first = els[0],
            last = els[els.length - 1];
          if (
            e.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === panel.current)
          ) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }}
      >
        <div className="sheet-handle" />
        <div className="modal-header">
          {modal.type === "open" && step > 0 && (
            <IconBtn label="Previous step" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={18} />
            </IconBtn>
          )}
          <h2 id="modal-title">{title}</h2>
          <IconBtn label="Close dialog" onClick={close}>
            <X size={20} />
          </IconBtn>
        </div>
        {body}
      </div>
    </div>
  );
}
function Scanner({
  onCode,
  demo,
}: {
  onCode: (code: string) => void;
  demo: () => void;
}) {
  const [cameraState, setCameraState] = useState("idle");
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const scanner = useRef<Html5Qrcode | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (scanner.current?.isScanning)
        void scanner.current.stop().catch(() => {});
    };
  }, []);
  async function start() {
    setError("");
    setCameraState("starting");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const s = new Html5Qrcode("tab-camera");
      scanner.current = s;
      await s.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (text) => {
          if (!alive.current) return;
          void s
            .stop()
            .then(() => {
              if (alive.current) onCode(text);
            })
            .catch(() => {});
        },
        () => {},
      );
      if (!alive.current) {
        await s.stop();
        return;
      }
      setCameraState("active");
    } catch {
      if (alive.current) {
        setCameraState("idle");
        setError(
          "Camera unavailable or permission denied. Allow camera access in browser settings, or paste a TAB link below.",
        );
      }
    }
  }
  return (
    <>
      <p className="subheading center">
        A spot. A friend. A whole night.
        <br />
        Point your camera at a TAB code.
      </p>
      <div className="scanner-frame">
        <div id="tab-camera" />
        {cameraState !== "active" && (
          <div className="scanner-placeholder">
            <QrCode size={72} />
            <span>Keep the code inside the frame</span>
          </div>
        )}
        <i className="scan-line" />
      </div>
      {error && <p className="form-error">{error}</p>}
      <Btn disabled={cameraState !== "idle"} onClick={start}>
        <Camera size={18} />
        {cameraState === "starting"
          ? "Opening camera…"
          : cameraState === "active"
            ? "Camera is on"
            : "Enable camera"}
      </Btn>
      <label className="field-label" htmlFor="scan-link">
        Or paste a TAB link
      </label>
      <div className="link-input">
        <input
          id="scan-link"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://…?venue=…"
        />
        <IconBtn label="Open TAB link" onClick={() => onCode(input)}>
          <ChevronRight />
        </IconBtn>
      </div>
      <Btn secondary onClick={demo}>
        Try a sample venue code
      </Btn>
    </>
  );
}
