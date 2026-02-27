import { IconCategory, IconLayoutDashboard, IconNotebook } from "@tabler/icons-react";
import type { SidebarAdminType } from "../types/sidebar_admin";


export const SIDEBAR_ADMIN_ITEMS: SidebarAdminType[] = [
    {
        label: 'Home',
        children: [
            {
                icon: IconLayoutDashboard,
                hasAccess: [],
                label: "Dashboard",
                url: "/admin",
            }
        ]
    }, {
        label: 'Menu',
        children: [
            {
                icon: IconCategory,
                label: "Master",
                url: "/admin/master",
                children: [
                    {
                        label: 'Group Siswa',
                        url: '/admin/master/student-group',
                    },
                    {
                        label: 'Master Siswa',
                        url: '/admin/master/student-master',
                    },
                ]
            },
            {
                icon: IconNotebook,
                label: "Bank Soal",
                url: "/admin/question-bank",
                children: [
                    {
                        label: 'Kategori Soal',
                        url: '/admin/question-bank/question-category',
                    },
                    {
                        label: 'Tipe Soal',
                        url: '/admin/question-bank/question-group',
                    },
                    // {
                    //     label: 'Bank Soal',
                    //     url: '/admin/question-bank/question-bank',
                    // },
                ]
            },
            {
                icon: IconNotebook,
                label: "Ujian",
                url: "/admin/question-bank",
                children: [
                    {
                        label: 'Data Ujian',
                        url: '/admin/exam/exam-data',
                    },
                    {
                        label: 'Monitoring Ujian',
                        url: '/admin/exam/exam-monitoring',
                    },
                ]
            },
            // {
            //     icon: IconNotebook,
            //     label: "Laporan",
            //     url: "/admin/report",
            // },
        ]
    },
]