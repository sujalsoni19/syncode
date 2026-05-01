import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePassword } from "@/api/user.api.js";
import { toast } from "react-hot-toast";

const changePasswordSchema = z
  .object({
    oldpassword: z.string().min(6, "Password must be at least 6 characters"),

    newpassword: z.string().min(6, "password must be at least 6 characters"),
  })
  .refine((data) => data.oldpassword !== data.newpassword, {
    message: "New password cannot be same as old password",
    path: ["newpassword"],
  });

export default function Cpassword() {
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const res = await changePassword(data);
      reset();
      toast.success("Password changed successfully");
      navigate("/home");
    } catch (error) {
      console.log("error while changing password: ", error);
      setServerError(error.response?.data?.message || "something went wrong");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-8 shadow-xl">
        <h2 className="mb-6 text-2xl font-semibold text-center">
          Change password
          <p className="text-sm font-light">
            Enter your current password and choose a new secure one.
          </p>
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Old password</label>
            <input
              type="password"
              {...register("oldpassword")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
              placeholder="••••••••"
            />
            {errors.oldpassword && (
              <p className="text-sm text-red-400">
                {errors.oldpassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-zinc-400">New password</label>
            <input
              type="password"
              {...register("newpassword")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
              placeholder="••••••••"
            />
            {errors.newpassword && (
              <p className="text-sm text-red-400">
                {errors.newpassword.message}
              </p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}
          {/* Submit */}
          <button
            type="submit"
            className="w-full cursor-pointer rounded-md bg-emerald-500 py-2 font-medium text-black transition hover:bg-emerald-400"
          >
            Change password
          </button>
        </form>
      </div>
    </div>
  );
}
