export const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid Date";

    // Format the date as YYYY-MM-DD HH:MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error";
  }
};



export function shortenAddress(address: string, chars = 6): string {
  if (!address) return "-";

  if (address.length <= chars * 2 + 2) return address;

  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export const AuthenticateUser = () => {
  
  let user = null;
  let token = localStorage.getItem("token");
  try {
    const userString = localStorage.getItem("user");
    if (userString) {
      user = JSON.parse(userString);
    }
  } catch (error) {
    return;
  }
  if (
    !token ||
    !user ||
    !(typeof user === "object") ||
    Object.keys(user).length === 0
  ) {
    return false;
  }
  else{
    return true;
  }
};
