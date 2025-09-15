function ToggleButtons({ isLogin, setIsLogin }) {
    return (
      <div className="flex mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
        <button
          onClick={() => setIsLogin(true)}
          className={`w-1/2 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
            isLogin
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`w-1/2 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
            !isLogin
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Sign Up
        </button>
      </div>
    );
  }
  
  export default ToggleButtons;
  