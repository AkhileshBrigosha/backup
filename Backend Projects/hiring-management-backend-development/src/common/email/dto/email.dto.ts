export class EmailDto{
    to: any;
    from?: string;
    cc?: string;
    subject: string;
    template?: string;
    context: {};
    attachments?: {filename: string, path: string, cid?: string}[];
    alternative?: {};
    icalEvent?: {};

}