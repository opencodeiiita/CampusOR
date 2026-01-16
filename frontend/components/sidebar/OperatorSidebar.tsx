'use client';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard,Activity,LogOut } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function OperatorSidebar(){
    const pathname=usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const linkStyle=(href:string)=>{
        const isActive=pathname===href || pathname.startsWith(`${href}/`);
        return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;
    };
    return (
        <aside className="w-48 sm:w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50">
            <div className="p-4 sm:p-6">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                    Ops<span className="hidden sm:inline">Portal</span>

                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-1">
                <Link href='/dashboard/operator' className={linkStyle('/dashboard/operator')}>
                    <LayoutDashboard size={20}/>
                    <span className="font-medium text-sm sm:text-base">Queues</span>
                </Link>
                <Link href='/dashboard/operator/create' className={linkStyle('/dashboard/operator/create')}>
                    <Activity size={20}/>
                    <span className="font-medium text-sm sm:text-base">Create Queue</span>
                </Link>
                
            </nav>
            <div className="p-4 border-t border-gray-100">
                <button 
                    onClick={() => {
                        logout();
                        router.push("/login");
                    }}
                    className="flex items-center gap-3 px-3 sm:px-4 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span className="font-medium text-sm sm:text-base">Logout</span>
                </button>
            </div>
        </aside>
    )
}
