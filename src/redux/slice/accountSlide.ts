import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callFetchAccount } from "@/config/api";

// First, create the thunk
export const fetchAccount = createAsyncThunk(
  "account/fetchAccount",
  async () => {
    const response = await callFetchAccount();
    return response.data;
  }
);

interface IState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshToken: boolean;
  errorRefreshToken: string;
  user: {
    _id: string;
    email: string;
    name: string;
    role: {
      _id: string;
      name: string;
    };
    age: number;
    address: string;
    company: {
      // Thêm thông tin công ty vào user
      _id: string;
      name: string;
    };
    permissions: {
      _id: string;
      name: string;
      apiPath: string;
      method: string;
      module: string;
    }[];
    avatar: string;
    connected: string[] | undefined;
  };
  activeMenu: string;
}

const initialState: IState = {
  isAuthenticated: false,
  isLoading: true,
  isRefreshToken: false,
  errorRefreshToken: "",
  user: {
    _id: "",
    email: "",
    name: "",
    role: {
      _id: "",
      name: "",
    },
    age: 0,
    address: "",
    company: {
      // Thêm thông tin công ty vào user
      _id: "",
      name: "",
    },
    permissions: [],
    avatar: "",
    connected: [],
  },

  activeMenu: "home",
};

export const accountSlide = createSlice({
  name: "account",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setActiveMenu: (state, action) => {
      state.activeMenu = action.payload;
    },
    setUserLoginInfo: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user._id = action?.payload?._id;
      state.user.email = action.payload.email;
      state.user.name = action.payload.name;
      state.user.age = action.payload.age;
      state.user.address = action.payload.address;
      state.user.role = action?.payload?.role;
      state.user.permissions = action?.payload?.permissions;
      state.user.company = action?.payload?.company;
      state.user.avatar = action?.payload?.avatar;
      state.user.connected = action?.payload?.connected;
      console.log("Payload:", action.payload);
      console.log("Company:", action.payload?.company);
    },
    setLogoutAction: (state, action) => {
      localStorage.removeItem("access_token");
      state.isAuthenticated = false;
      state.user = {
        _id: "",
        email: "",
        name: "",
        role: {
          _id: "",
          name: "",
        },
        age: 0,
        address: "",
        company: {
          // Thêm thông tin công ty vào user
          _id: "",
          name: "",
        },
        permissions: [],
        avatar: "",
        connected: [],
      };
    },
    setRefreshTokenAction: (state, action) => {
      state.isRefreshToken = action.payload?.status ?? false;
      state.errorRefreshToken = action.payload?.message ?? "";
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchAccount.pending, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = false;
        state.isLoading = true;
      }
    });

    builder.addCase(fetchAccount.fulfilled, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.isLoading = false;
        state.user._id = action?.payload?.user?._id;
        state.user.email = action.payload.user?.email;
        state.user.name = action.payload.user?.name;
        state.user.age = action.payload.user?.age;
        state.user.address = action.payload.user?.address;
        state.user.role = action?.payload?.user?.role;
        state.user.permissions = action?.payload?.user?.permissions;
        state.user.company = action?.payload?.user?.company;
        state.user.avatar = action?.payload?.user?.avatar;
        state.user.connected = action?.payload?.user?.connected;
      }
    });

    builder.addCase(fetchAccount.rejected, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = false;
        state.isLoading = false;
      }
    });
  },
});

export const {
  setActiveMenu,
  setUserLoginInfo,
  setLogoutAction,
  setRefreshTokenAction,
} = accountSlide.actions;

export default accountSlide.reducer;
