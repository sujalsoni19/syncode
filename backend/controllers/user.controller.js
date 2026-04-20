import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { resetPasswordTemplate } from "../utils/emailTemplate.js";

const isProd = process.env.NODE_ENV === "production";

const options = {
  httpOnly: true,
  secure: isProd,
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  let { username, fullname, email, password } = req.body;

  username = username?.trim().toLowerCase();
  fullname = fullname?.trim();
  email = email?.trim().toLowerCase();
  password = password?.trim();

  if (!username || !fullname || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    if (existedUser.username === username) {
      throw new ApiError(400, "Username already taken");
    }
    if (existedUser.email === email) {
      throw new ApiError(400, "Email already registered");
    }
  }

  const user = await User.create({
    username,
    fullname,
    email,
    password,
  });

  const created_user = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!created_user) {
    throw new ApiError(500, "there was a problem while creating a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, created_user, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  email = email?.trim().toLowerCase();
  password = password?.trim();

  if (!email || !password) {
    throw new ApiError(400, "Both fields are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      returnDocument: "after",
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized ");
  }

  console.log("incomingRefreshToken:", incomingRefreshToken);

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  let { fullname, username } = req.body;

  if (!fullname && !username) {
    throw new ApiError(400, "At least one field must be provided");
  }

  const updates = {};

  if (fullname) {
    updates.fullname = fullname.trim();
  }

  if (username) {
    username = username.trim().toLowerCase();

    if (username !== req.user.username) {
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        throw new ApiError(400, "Username already exists");
      }
    }

    updates.username = username;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  let { oldpassword, newpassword } = req.body;

  oldpassword = oldpassword?.trim();
  newpassword = newpassword?.trim();

  if (!oldpassword || !newpassword) {
    throw new ApiError(400, "Both fields are required");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldpassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

  if (oldpassword === newpassword) {
    throw new ApiError(400, "New password cannot be same as old password");
  }

  user.password = newpassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  let { email } = req.body;

  if (!email || !email.trim()) {
    throw new ApiError(400, "email is required");
  }

  email = email.trim().toLowerCase();

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "If the email exists, reset link sent"));
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.CORS_ORIGIN}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset",
    html:  resetPasswordTemplate(resetURL),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset link sent to email"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const {token} = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or expired");
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successful"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
