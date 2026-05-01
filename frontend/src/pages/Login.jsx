import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUsercontext } from "@/context/userContext.jsx";
import { loginUser } from "@/api/user.api.js";
import { toast } from "react-hot-toast";

const loginSchema = z.object({
  email: z.email("Invalid email address"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUsercontext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const res = await loginUser(data);
      reset();
      toast.success("Logged in successfully");
      navigate("/home");
      setUser(res?.data?.data?.user);
    } catch (error) {
      setServerError(error.response?.data?.message || "something went wrong");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-8 shadow-xl">
        <h2 className="mb-6 text-2xl font-semibold text-center">
          Welcome back to Syncode
          <p className="text-sm font-light">
            New here?{" "}
            <Link
              to="/register"
              className="text-emerald-400 underline hover:text-emerald-300"
            >
              create an account
            </Link>
          </p>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm text-zinc-400">Email</label>
            <input
              type="email"
              {...register("email")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
              placeholder="Enter your registered email"
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between">
              <label className="text-sm text-zinc-400">Password</label>
              <Link
                to="/reset-password"
                className="text-emerald-400 text-sm font-extralight underline hover:text-emerald-300"
              >
                forgot password?
              </Link>
            </div>
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}
          {/* Submit */}
          <button
            type="submit"
            className="w-full cursor-pointer rounded-md bg-emerald-500 py-2 font-medium text-black transition hover:bg-emerald-400"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
