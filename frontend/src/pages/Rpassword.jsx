import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/api/user.api.js";
import { toast } from "react-hot-toast";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Rpassword() {
  const [serverError, setServerError] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const res = await resetPassword(token, data);
      reset();
      toast.success("Password reset successfully. Please sign in.");
      navigate("/login");
    } catch (error) {
      console.log("error while resetting password: ", error);
      setServerError(error.response?.data?.message || "something went wrong");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-8 shadow-xl">
        <h2 className="mb-6 text-2xl font-semibold text-center">
          Reset password
          <p className="text-sm font-light">
            Make sure it's at least 6 characters
          </p>
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Password</label>
            <input
              type="password"
              {...register("newPassword")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
              placeholder="••••••••"
            />
            {errors.newPassword && (
              <p className="text-sm text-red-400">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-zinc-400">Confirm password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}
          {/* Submit */}
          <button
            type="submit"
            className="w-full cursor-pointer rounded-md bg-emerald-500 py-2 font-medium text-black transition hover:bg-emerald-400"
          >
            Reset password
          </button>
        </form>
      </div>
    </div>
  );
}
