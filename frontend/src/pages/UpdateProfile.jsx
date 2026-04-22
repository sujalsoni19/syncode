import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUsercontext } from "@/context/userContext.jsx";
import { updateUserProfile } from "@/api/user.api.js";
import {toast} from "react-hot-toast"

const updateSchema = z
  .object({
    fullname: z.string().min(3).optional(),
    username: z.string().min(3).max(30).optional(),
  })
  .refine((data) => data.fullname || data.username, {
    message: "At least one field must be provided",
  });

export default function UpdateProfile() {
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useUsercontext();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(updateSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        fullname: user.fullname,
        username: user.username,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const res = await updateUserProfile(data);
      console.log(res);
      const updatedUser = res?.data?.data;

      setUser(updatedUser); // update auth state first
      reset();
      toast.success("Profile updated successfully");
      navigate("/home"); // then redirect
    } catch (error) {
      console.log("error while updating user profile: ", error);
      setServerError(error.response?.data?.message || "something went wrong");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-8 shadow-xl">
        {/* Heading */}
        <h2 className="text-2xl font-semibold text-center">
          Update your Syncode profile
        </h2>

        <p className="mb-6 mt-1 text-center text-sm text-zinc-400">
          Edit your name and username.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Fullname */}
          <div>
            <label className="text-sm text-zinc-400">Full Name</label>
            <input
              type="text"
              {...register("fullname")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
            />
            {errors.fullname && (
              <p className="text-sm text-red-400">{errors.fullname.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="text-sm text-zinc-400">Username</label>
            <input
              type="text"
              {...register("username")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
            />
            {errors.username && (
              <p className="text-sm text-red-400">{errors.username.message}</p>
            )}
          </div>

          {/* Email (read only) */}
          <div>
            <label className="text-sm text-zinc-400">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 text-zinc-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Email address cannot be changed.
            </p>
          </div>

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isDirty}
            className={`w-full rounded-md py-2 font-medium text-black transition ${
              isDirty
                ? "cursor-pointer bg-emerald-500 hover:bg-emerald-400"
                : "cursor-not-allowed bg-zinc-700 text-zinc-400"
            }`}
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}
