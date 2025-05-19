import React from "react";

interface SkeletonTableLoaderProps {
  headings: string[];
  rowCount?: number;
  minWidth?: string;
}

const SkeletonTableLoader: React.FC<SkeletonTableLoaderProps> = ({
  headings,
  rowCount = 10, // Default to 10 rows
  minWidth="800", // Default minimum width

}) => {
  return (
    <div className="flex-1 rounded-lg w-full py-5 ">
      {/* Table */}
      <div className="rounded-lg overflow-x-auto w-full min-h-[200px]">
        <table className={`w-full text-left table-auto  min-w-[400px] sm:min-w-[1000px]`}>
          <thead className="bg-secondary/10">
            <tr className="font-satoshi text-[12px] sm:text-[16px] py-3 sm:py-4 px-2 sm:px-4">
              {headings.map((heading, index) => (
                <th
                  key={index}
                  className="px-2 sm:px-4 py-3 sm:py-4 text-left whitespace-nowrap"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="animate-pulse">
            {Array(rowCount)
              .fill(0)
              .map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-200 text-[12px] sm:text-[16px]"
                >
                  {Array(headings.length)
                    .fill(0)
                    .map((_, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-2 sm:px-4 py-3 sm:py-4 font-satoshi"
                      >
                        {/* Different widths for skeleton items to make them look more natural */}
                        <div
                          className={`h-5 bg-gray-200 rounded w-full`}
                        ></div>
                      </td>
                    ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SkeletonTableLoader;
