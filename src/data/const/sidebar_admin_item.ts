import { IconCategory, IconLayoutDashboard, IconNotebook } from "@tabler/icons-react";
import type { SidebarAdminType } from "../types/sidebar_admin";
import { ROLE_ADMIN, ROLE_STUDENT } from "../enums/Role";


export const SIDEBAR_ADMIN_ITEMS: SidebarAdminType[] = [
    {
        label: 'Menu',
        children: [
            {
                icon: IconLayoutDashboard,
                hasAccess: [ROLE_ADMIN],
                label: "Dashboard",
                url: "/admin",
            },
            {
                hasAccess: [ROLE_ADMIN],
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
                hasAccess: [ROLE_ADMIN],
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
                hasAccess: [ROLE_ADMIN],
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
            {
                hasAccess: [ROLE_STUDENT],
                icon: IconNotebook,
                label: "Ujian",
                url: "/user/exam",
            },
            {
                hasAccess: [ROLE_STUDENT],
                icon: IconNotebook,
                label: "Riwayat Ujian",
                url: "/user/exam-history",
            },
            // {
            //     icon: IconNotebook,
            //     label: "Laporan",
            //     url: "/admin/report",
            // },
        ]
    },
]