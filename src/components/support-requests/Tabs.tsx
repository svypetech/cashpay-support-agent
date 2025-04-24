interface TabsProps {
    tabs: string[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
    size: string
}
export default function Tabs({ tabs,activeTab, setActiveTab,size }: TabsProps) {
    
    const getSize = () =>{
        switch (size) {
            case "normal":
                return "text-md"
            case "small":
                return "text-sm"
            default:
                return "text-lg"
        }
    }
    return (
        
        <div className="flex items-center justify-between">
            <div className={`flex gap-2 ${getSize()}`}>
            {tabs.map((tab:string) => (
                <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2  ${
                    activeTab === tab ? " border-b-2 border-primary font-bold" : ""
                }`}
                >
                {tab}
                </button>
            ))}
            </div>
        </div>
        
    );
    }
    