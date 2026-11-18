import { supabase, supabaseConfigured } from "./supabase.js";

export function initializeAuth() {
  const modal = document.getElementById("authModal");
  const form = document.getElementById("authForm");
  const feedback = document.getElementById("authFeedback");
  const submit = document.getElementById("authSubmit");
  const fullName = document.getElementById("authFullName");
  const fullNameLabel = document.getElementById("fullNameLabel");
  const tabs = [...document.querySelectorAll("[data-auth-mode]")];
  const dialog = modal?.querySelector(".auth-dialog");
  if (!modal || !form || !feedback || !submit || !dialog) return;

  let mode = "login";
  let busy = false;
  let accountPanel = null;

  const copy = {
    fr: {
      welcome: "Bienvenue sur STUDY TECH",
      intro: "Crée ton compte gratuit ou connecte-toi.",
      fullName: "Nom complet",
      email: "Adresse e-mail",
      password: "Mot de passe",
      login: "Connexion",
      signup: "Créer mon compte",
      security: "Tes informations sont protégées. Ne partage jamais ton mot de passe.",
      config: "Le service de comptes n'est pas encore configuré. L'administrateur doit terminer la configuration Supabase.",
      required: "Veuillez remplir tous les champs obligatoires.",
      invalidEmail: "Veuillez saisir une adresse e-mail valide.",
      shortPassword: "Le mot de passe doit contenir au moins 8 caractères.",
      success: "Compte créé. Vérifie ta boîte e-mail pour confirmer ton adresse avant de te connecter.",
      signedIn: "Connexion réussie.",
      signedOut: "Tu es maintenant déconnecté.",
      account: "Ton espace STUDY TECH",
      logout: "Se déconnecter",
      generic: "Une erreur est survenue. Réessaie dans quelques instants.",
      invalidCredentials: "Adresse e-mail ou mot de passe incorrect.",
      emailExists: "Cette adresse e-mail possède déjà un compte.",
      emailNotConfirmed: "Confirme ton adresse e-mail avant de te connecter."
    },
    en: {
      welcome: "Welcome to STUDY TECH",
      intro: "Create your free account or sign in.",
      fullName: "Full name",
      email: "Email address",
      password: "Password",
      login: "Sign in",
      signup: "Create account",
      security: "Your information is protected. Never share your password.",
      config: "The account service is not configured yet. The administrator must finish the Supabase setup.",
      required: "Please complete all required fields.",
      invalidEmail: "Please enter a valid email address.",
      shortPassword: "Your password must contain at least 8 characters.",
      success: "Account created. Check your inbox to confirm your email address before signing in.",
      signedIn: "You are signed in.",
      signedOut: "You have signed out.",
      account: "Your STUDY TECH space",
      logout: "Sign out",
      generic: "Something went wrong. Please try again shortly.",
      invalidCredentials: "Incorrect email address or password.",
      emailExists: "An account already exists for this email address.",
      emailNotConfirmed: "Confirm your email address before signing in."
    }
  };

  const t = (key) => (copy[document.documentElement.lang === "en" ? "en" : "fr"][key] || key);
  const setFeedback = (message, type = "info") => {
    feedback.textContent = message;
    feedback.dataset.type = type;
  };

  function setMode(nextMode) {
    mode = nextMode === "signup" ? "signup" : "login";
    const isSignup = mode === "signup";
    fullName.hidden = !isSignup;
    fullNameLabel.hidden = !isSignup;
    fullName.required = isSignup;
    fullName.autocomplete = "name";
    document.getElementById("authTitle").textContent = t("welcome");
    modal.querySelector(".auth-intro").textContent = t("intro");
    modal.querySelector('[for="authFullName"]').textContent = t("fullName");
    modal.querySelector('[for="authEmail"]').textContent = t("email");
    modal.querySelector('[for="authPassword"]').textContent = t("password");
    modal.querySelector(".auth-legal").textContent = t("security");
    submit.textContent = isSignup ? t("signup") : t("login");
    tabs.forEach((tab) => {
      const active = tab.dataset.authMode === mode;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    setFeedback("");
  }

  function openModal(nextMode = "login") {
    modal.hidden = false;
    document.body.classList.add("modal-open");
    if (accountPanel) accountPanel.hidden = true;
    form.hidden = false;
    modal.querySelector(".auth-tabs").hidden = false;
    setMode(nextMode);
    window.setTimeout(() => (nextMode === "signup" ? fullName : document.getElementById("authEmail")).focus(), 0);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function showAccount(user) {
    form.hidden = true;
    modal.querySelector(".auth-tabs").hidden = true;
    if (!accountPanel) {
      accountPanel = document.createElement("div");
      accountPanel.className = "auth-account";
      accountPanel.innerHTML = '<p class="auth-account-email"></p><button class="button button-primary button-large auth-submit" type="button"></button>';
      dialog.append(accountPanel);
      accountPanel.querySelector("button").addEventListener("click", async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) setFeedback(t("generic"), "error");
        else {
          accountPanel.hidden = true;
          form.reset();
          form.hidden = false;
          modal.querySelector(".auth-tabs").hidden = false;
          setMode("login");
          setFeedback(t("signedOut"), "success");
        }
      });
    }
    accountPanel.hidden = false;
    accountPanel.querySelector(".auth-account-email").textContent = user.email || "";
    accountPanel.querySelector("button").textContent = t("logout");
    document.getElementById("authTitle").textContent = t("account");
    modal.querySelector(".auth-intro").textContent = user.email || "";
  }

  document.querySelectorAll("[data-auth-open]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(link.dataset.authOpen);
    });
  });
  modal.querySelectorAll("[data-auth-close]").forEach((element) => element.addEventListener("click", closeModal));
  tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.authMode)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!supabaseConfigured || !supabase) {
      setFeedback(t("config"), "error");
      return;
    }

    const email = document.getElementById("authEmail").value.trim().toLowerCase();
    const password = document.getElementById("authPassword").value;
    const name = fullName.value.trim();

    if (!email || !password || (mode === "signup" && !name)) {
      setFeedback(t("required"), "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFeedback(t("invalidEmail"), "error");
      return;
    }
    if (password.length < 8) {
      setFeedback(t("shortPassword"), "error");
      return;
    }

    busy = true;
    submit.disabled = true;
    submit.textContent = "…";
    setFeedback("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name.slice(0, 100),
              preferred_language: document.documentElement.lang === "en" ? "en" : "fr"
            },
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        if (data.session && data.user) {
          showAccount(data.user);
          setFeedback(t("signedIn"), "success");
        } else {
          form.reset();
          setFeedback(t("success"), "success");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          showAccount(data.user);
          setFeedback(t("signedIn"), "success");
        }
      }
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("invalid login") || message.includes("invalid credentials")) setFeedback(t("invalidCredentials"), "error");
      else if (message.includes("already registered") || message.includes("already exists")) setFeedback(t("emailExists"), "error");
      else if (message.includes("email not confirmed")) setFeedback(t("emailNotConfirmed"), "error");
      else setFeedback(error?.message || t("generic"), "error");
    } finally {
      busy = false;
      submit.disabled = false;
      submit.textContent = mode === "signup" ? t("signup") : t("login");
    }
  });

  if (!supabaseConfigured) {
    document.querySelectorAll("[data-auth-open]").forEach((link) => {
      link.addEventListener("click", () => setFeedback(t("config"), "error"));
    });
  } else {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) showAccount(data.session.user);
    }).catch(() => setFeedback(t("generic"), "error"));
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !modal.hidden) showAccount(session.user);
    });
  }

  setMode("login");
}
