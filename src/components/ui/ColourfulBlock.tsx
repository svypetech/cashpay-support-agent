export default function ColourfulBlock({ text, className }: { text: string; className?: string; }){
    return (
        <span className={`font-[700] rounded-[12px] px-[24px] py-[12px] w-[120px] h-[45px] flex justify-center items-center border-box ${className}`}>  {/* Fixed the className placement */}
                    {text}
                    </span>
    )
}