import React from 'react';
import {Navigate, Outlet} from "react-router-dom";

function PrivateRouter({socket}) {
    const token = localStorage.getItem("userTicTac") ? JSON.parse(localStorage.getItem("userTicTac")).id : null
    return (
        <div>
            {token ?
                <Outlet /> :
                <Navigate to="/login" />
            }
        </div>
    );
}

export default PrivateRouter;
