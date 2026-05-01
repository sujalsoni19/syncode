import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/api/user.api.js";
import { toast } from "react-hot-toast";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),

  fullname: z.string().min(3, "Full name must be at least 3 characters"),

  email: z.email("Invalid email address"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      await registerUser(data);
      reset();
      toast.success("Account created. Please sign in.");
      navigate("/login");
    } catch (error) {
      console.log("error while registering user: ", error);
      setServerError(error.response?.data?.message || "something went wrong");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-8 shadow-xl">
        <h2 className="mb-6 text-2xl font-semibold text-center">
          Create Account
          <p className="text-sm font-light">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-emerald-400 underline hover:text-emerald-300"
            >
              Login
            </Link>
          </p>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-sm text-zinc-400">Username</label>
            <input
              {...register("username")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
              placeholder="harry_potter"
            />
            {errors.username && (
              <p className="text-sm text-red-400">{errors.username.message}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="text-sm text-zinc-400">Full Name</label>
            <input
              {...register("fullname")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
              placeholder="Harry Potter"
            />
            {errors.fullname && (
              <p className="text-sm text-red-400">{errors.fullname.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-zinc-400">Email</label>
            <input
              type="email"
              {...register("email")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
              placeholder="harry@email.com"
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-zinc-400">Password</label>
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
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
