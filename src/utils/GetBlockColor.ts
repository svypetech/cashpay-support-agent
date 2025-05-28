export const getStatusColors = (status: string) => {
    switch(status.toLowerCase()) {
      case "failed":
        return "bg-[#DF1D1D]/20 text-[#DF1D1D]";
      case "resolved":
        return "bg-[#71FB5533] text-[#20C000]";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }