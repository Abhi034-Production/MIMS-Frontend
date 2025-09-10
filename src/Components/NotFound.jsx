import React from "react";
import Seo from "./Seo";


const NotFound = () => {
    return (
        <>
            <Seo
                title="404 | Page Not Found | easyinventory"
                description="The page you are looking for does not exist on easyinventory. Check the URL or return to the homepage."
                url="https://easyinventory.online/404"
                keywords="404, page not found, easyinventory, inventory management"
            />

            <div className="bg-gray-200 dark:bg-gray-900 text-center h-screen w-full flex items-center justify-center transition-colors">
                <h3 className="text-black dark:text-white font-semibold text-2xl">404 | Page Not Found</h3>
            </div>
        </>
    )
}

export default NotFound