#  Katkot - Social Blogging Platform

**Katkot** is a modern, minimal social blogging app where users can write, share, and discover content. Built with performance and simplicity in mind, it offers a clean writing experience and a dynamic post feed — all backed by Supabase and TanStack Query.

---

## 🚀 Features

- 🔐 User authentication (Sign up, Login, Logout)
- 📝 Create and edit rich-text posts
- 💬 Comment system for user interactions
- 📁 Upload cover images (Supabase Storage)
- 🌐 Dynamic routing and user profiles
- 📊 Optimized fetching and caching with React Query
- 🌍 Multilingual support via i18n
- 🎨 Responsive UI with Tailwind CSS

---

## 🛠️ Tech Stack

| Category         | Tools & Frameworks                                   |
|------------------|------------------------------------------------------|
| Frontend         | [Next.js](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| State / Data     | [TanStack Query](https://tanstack.com/query)         |
| Auth / Backend   | [Supabase](https://supabase.com/)                    |
| Styling          | [Tailwind CSS](https://tailwindcss.com/)             |

---

## 🏗️ Architecture Overview

- **Next.js App Router**: Utilizes localized routes under the `[locale]` folder for multilingual support.
- **ClientLayout**: Manages theme (dark/light) and RTL (right-to-left) support, providing the main layout structure.
- **Context Providers**: 
  - `SessionContext` for session management.
  - No `PointsContext` or Redux is currently implemented (removed as placeholder).
- **Component Structure**: Follows an Atomic Design Pattern:
  - **Atoms**: Basic UI elements (e.g., Buttons, Inputs, Icons).
  - **Molecules**: Simple combinations (e.g., UserGreeting, NotificationBadge).
  - **Organisms**: Complex sections (e.g., LeftSidebar, PostCard).
  - **Templates**: Page-level layouts (e.g., FeedTemplate, AuthTemplate).
- **Data Fetching**: Leverages TanStack Query for optimized data fetching and caching, integrated with Supabase.
- **Localization**: Managed by `next-intl` with middleware for locale detection and routing.

---
## 📌 Folder Structure (simplified)

```
katkot/
│
├── components/          → Reusable UI Components (Atomic Design: atoms, molecules, organisms, templates)
├── hooks/               → Custom React Hooks
├── contexts/            → Auth / Theme providers
├── app/                 → Next.js App Router with localized routes
├── lib/                 → Supabase client, Redux store, helpers
├── public/              → Static assets
├── styles/              → Tailwind / Global styles
├── i18n/                → Translation files
└── ...
```

---


## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 💬 Contact

> Created by [Seif Elesawy](https://github.com/seifelden66)  
> 📧 seifelden66@gmail.com