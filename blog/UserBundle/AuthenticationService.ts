var crypto = require("crypto");
var config = require('../../config.js');
import { AccessLogger } from "../Logger";
import * as http from "http";
import * as Cookies from '../Cookies';
import * as mongoose from "mongoose";
import { IDictionary } from "../Infastructure/Dictionary";

class Session
{
    id: string;
    token: string;
    expires: Date;
    username: string;
}

export class SessionManager
{
    private readonly sessionIDKey: string = "sessionId";
    private readonly authTokenKey: string = "authToken";
    private static _instance: SessionManager;
    private Sessions: Session[];

    constructor()
    {
        this.Sessions = [];
    }

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }

    /**
     * Creates new session
     * @param string username
     * @returns Session
     */
    public CreateSession = (response: http.ServerResponse, username: string): Session =>
    {
        let session = new Session();
        let objectId = new mongoose.Types.ObjectId;
        session.id = objectId.toString();
        session.token = crypto.randomBytes(64).toString('hex');
        session.expires = new Date(new Date().getTime() + 3600000);
        session.username = username;
        this.Sessions.push(session);

        Cookies.SetCookies(response, [
            new Cookies.Cookie(this.sessionIDKey, session.id, session.expires),
            new Cookies.Cookie(this.authTokenKey, session.token, session.expires),
        ]);

        return session;
    }

    /**
     * Removes Session
     * @param string id
     */
    public RemoveSession = (response: http.ServerResponse, id: string): void =>
    {
        for (var i = 0; i < this.Sessions.length; i++)
        {
            if (this.Sessions[i].id === id)
            {
                this.Sessions.splice(i, 1);
            }
        }

        Cookies.SetCookies(response, [
            new Cookies.Cookie(this.sessionIDKey, "", new Date(0)),
            new Cookies.Cookie(this.authTokenKey, "", new Date(0))
        ]);
    }

    /**
     * Checks if id & token belongs to valid session
     * @param string id
     * @param string token
     * @returns Session
     */
    public IsTokenValid = (cookies: IDictionary<string>): Session | null =>
    {
        let id = cookies[this.sessionIDKey];
        let token = cookies[this.authTokenKey];

        if (!id || !token)
        {
            return null;
        }

        for (var i = 0; i < this.Sessions.length; i++)
        {
            if (this.Sessions[i].id === id && this.Sessions[i].token === token)
            {
                if (new Date() > new Date(this.Sessions[i].expires))
                {
                    this.Sessions.splice(i, 1);
                    return null;
                }

                return this.Sessions[i];
            }
        }

        AccessLogger().Warning("Invalid token: id:" + id + " token: " + token);
        return null;
    }

    /**
     * Get Session array
     * @return Session[]
     */
    public GetSessions = (): Session[] =>
    {
        return this.Sessions;
    }
}