export class SendMailEvent {
    constructor(
        public readonly email: string,
        public readonly content: string,
    ) { }

    toString() {
        return JSON.stringify({
            email: this.email,
            content: this.content,
        });
    }
}