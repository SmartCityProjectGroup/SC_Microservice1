import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader, Center } from "@mantine/core";
import { Login } from "../pages/Login";
import { AdminLogin } from "../pages/AdminLogin";
import Cookies from 'js-cookie';
import { AUTH_URL, COOKIE_URL } from "../util/Constants";

export class SmartAuth {

    static #data = null;

    static async #fetchData(token, url, setDataCallback) {
        try {
            const apiurl = `${AUTH_URL}${url || ''}`;
            const response = await fetch(apiurl, {
                method: 'POST', body: 'code=' + encodeURIComponent(token),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            if (!response.ok) { throw new Error(`${response.status} ${response.statusText}`); }
            const data = await response.json();
            setDataCallback(data);
            console.log("received user/employee data: ", data);
            return true;
        } catch (error) {
            setDataCallback(null);
            console.error(error);
            return false;
        }
    }

    static async verifyUser() {
        let result = false;
        //check if cookie user_session_token is set
        const tokenCookie = Cookies.get('user_session_token');
        if (tokenCookie !== undefined) {
            console.log("using token from cookie");
            result = await this.#fetchData(tokenCookie, '/verify', (data) => { this.#data = data; });
        }

        //check if token is in url search params
        let params = (new URL(document.location)).searchParams;
        const tokenUrl = params.get('token');
        if (tokenUrl !== null) {
            console.log("using token from url");
            result = await this.#fetchData(tokenUrl, '/verify', (data) => { this.#data = data; });
            //if on localhost, set cookie
            if (window.location.hostname === "localhost") {
                console.log("setting cookie for localhost");
                Cookies.set('user_session_token', tokenUrl);
            }
        }
        return new Promise((resolve) => resolve(result));
    }

    static async verifyAdmin() {
        let result = false;
        //check if cookie employee_session_token is set
        const tokenCookie = Cookies.get('employee_session_token');
        if (tokenCookie !== undefined) {
            console.log("using employee token from cookie");
            result = await this.#fetchData(tokenCookie, '/employee/verify', (data) => { });
        }
        return new Promise((resolve) => resolve(result));
    }

    static getCitizenID() {
        if (this.#data !== null) {
            return this.#data.citizen_id;
        }
        return null;
    }

    static getCitizen() {
        if (this.#data !== null) {
            return this.#data.info;
        }
        return null;
    }

    static logout() {
        Cookies.remove('user_session_token', { path: '/', domain: 'localhost' });
        Cookies.remove('user_session_token', { path: '/', domain: COOKIE_URL });
        Cookies.remove('employee_session_token', { path: '/', domain: 'localhost' });
        Cookies.remove('employee_session_token', { path: '/', domain: COOKIE_URL });
        SmartAuth.citizen = null;
    }

}

export function RequireAuth(props) {

    const location = useLocation();
    const [isLoading, setLoading] = useState(true);
    const { isLoggedIn, setLoggedIn, children } = props;

    useEffect(() => {
        SmartAuth.verifyUser().then((success) => {
            setLoggedIn(success);
            setLoading(false);
        });
    }, [setLoggedIn]);

    if (isLoading) {
        return <Center><Loader size="xl" color="green" mt="lg" /></Center>;
    } else {
        return isLoggedIn ? children : <Login redirect={location.pathname} />;
    }
}

export function RequireAdmin(props) {

    const location = useLocation();
    const [isLoading, setLoading] = useState(true);
    const [isAdmin, setAdmin] = useState(false);
    const { children } = props;

    useEffect(() => {
        SmartAuth.verifyAdmin().then((success) => {
            setAdmin(success);
            setLoading(false);
        });
    }, [setAdmin]);

    if (isLoading) {
        return <Center><Loader size="xl" color="green" mt="lg" /></Center>;
    } else {
        return isAdmin ? children : <AdminLogin redirect={location.pathname} />;
    }
}