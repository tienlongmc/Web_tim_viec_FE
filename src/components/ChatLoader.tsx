import HashLoader from "react-spinners/HashLoader";
const ChatLoader = () => {
  return (
    <div
      className="h-screen flex flex-col items-center justify-center p-4"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // giữa ngang
        justifyContent: "center", // giữa dọc
        padding: "1rem",
        transform: "translateY(-20px)",
      }}
    >
      <HashLoader
        className="animate-spin size-10 text-primary"
        color="#0059cc"
      />
      <p
        className="mt-4 text-center text-lg font-mono"
        style={{ marginTop: "20px" }}
      >
        Connecting to chat...
      </p>
    </div>
  );
};

export default ChatLoader;
