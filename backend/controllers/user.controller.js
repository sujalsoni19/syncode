import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

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

export { registerUser, loginUser };
