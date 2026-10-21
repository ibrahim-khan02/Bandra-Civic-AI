
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Mail,
  Building2,
} from "lucide-react";

export const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Invalid email or password.");
      }

      sessionStorage.setItem("adminToken",data.access_token);
      navigate("/admin",{replace:true});

      // Authentication is not complete until we also establish
      // and persist a real backend-verified session or token.
      navigate("/admin");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">

      {/* LEFT SIDE — BANDRA SEA LINK IMAGE */}
      <section className="relative hidden min-h-screen overflow-hidden lg:block">
        <img
          src="https://thumbs.dreamstime.com/b/detailed-night-aerial-view-bandra-worli-sea-link-interchange-aerial-night-view-mumbai-sea-link-highway-465712908.jpg"
          alt="Aerial night view of the Bandra-Worli Sea Link in Mumbai"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark overlay for readable text */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-slate-950/20" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between p-10 xl:p-14">
          <Link to="/" className="flex w-fit items-center gap-3 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 backdrop-blur-md">
              <Building2 size={25} />
            </div>

            <div>
              <p className="text-xl font-black tracking-tight">
                Bandra Civic AI
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Smart Civic Governance
              </p>
            </div>
          </Link>

          <div className="max-w-xl pb-8">
           {/*  <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Intelligent Civic Management
            </div> */}

            {/* <h1 className="text-4xl font-black leading-tight text-white xl:text-5xl">
              Building a better
              <br />
              Bandra, together.
            </h1> */}

            {/* <p className="mt-5 max-w-md text-base leading-7 text-slate-200">
              Manage civic complaints, monitor zonal insights, and help
              create safer, cleaner neighbourhoods through data-driven
              governance.
            </p> */}

            <div className="mt-8 flex items-center gap-3 text-sm text-slate-300">
              {/* <ShieldCheck size={19} /> */}
              {/* <span>Authorized administrative access</span> */}
            </div>
          </div>

          <p className="text-xs text-slate-300">
            © {new Date().getFullYear()} Bandra Civic AI | Ibrahim Khan   
          </p>
        </div>
      </section>

      {/* RIGHT SIDE — LOGIN FORM */}
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-20">
        <div className="w-full max-w-md">

          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-900"
          >
            <ArrowLeft size={16} />
            Back to Civic-AI
          </Link>

          {/* Mobile branding */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950 text-white">
              <Building2 size={25} />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">
                Bandra Civic AI
              </p>
              <p className="text-xs text-slate-500">
                Smart Civic Governance
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-950">
              <ShieldCheck size={30} />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-800">
              Administration Portal
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Welcome back
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in with your authorized administrator credentials
              to access the civic management dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Admin email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-700 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-700 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-indigo-950"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-950 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-950/10 transition hover:bg-indigo-900 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck size={18} />
              {loading ? "Verifying credentials..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="mt-7 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <LockKeyhole size={18} className="mt-0.5 shrink-0 text-slate-500" />
            <p className="text-xs leading-5 text-slate-500">
              This portal is restricted to authorized administrators.
              Your credentials must be verified by the server.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Bandra Civic AI · Mumbai, India
          </p>
        </div>
      </section>
    </div>
  );
};
