// deno-lint-ignore-file camelcase
import { isIP } from "./isIP.ts";

interface Meta {
    build: number;
    ip_version: number;
    languages: { [k: string]: number };
    node_count: number;
    total_size: number;
    fields: string[];
}

export class IPDB {
    #meta: Meta;
    data: DataView;
    #language: string;
    #v4offset: number;
    #dbType: number;
    #bitCount: number;
    #startNode: number;

    constructor(ipdbPath: string, language = "CN") {
        const buf = Deno.readFileSync(ipdbPath);
        const metaLen = new DataView(buf.buffer).getUint32(0, false);
        const meta = JSON.parse(new TextDecoder().decode(buf.slice(4, metaLen + 4)));
        this.#meta = meta;
        this.data = new DataView(buf.buffer.slice(metaLen + 4));
        this.#language = language;
        this.#v4offset = 0;
        this.#dbType = (meta.ip_version & 0x01) == 0x01 ? 4 : 6;
        this.#bitCount = this.#dbType === 4 ? 32 : 128;

        let node = 0;
        if (this.#bitCount == 32) {
            if (this.#v4offset == 0) {
                let i = 0;
                while (i < 96){
                    if (i >= 80) {
                        node = this.#readNode(node, 1);
                    } else{
                        node = this.#readNode(node, 0);
                    }
                    i += 1;
                }

                this.#v4offset = node;
            } else {
                node = this.#v4offset;
            }
        }
        this.#startNode = node;
    }

    find(ip: string): {[k: string]: string | number} | null {
        if (isIP(ip) !== this.#dbType) {
            throw Error(`Not support this IP type ${isIP(ip)}, supprted ${this.#dbType}`);
        }
        const ipBuf = this.#ipToByte(ip);

        const node = this.findNode(ipBuf);
        if (node <= 0) return null;

        const buf = this.#resolveNode(node);
        const ipInfo = new TextDecoder().decode(buf).split('\t');

        const off = this.#meta.languages[this.#language];
        return ipInfo.slice(off, off + this.#meta.fields.length)
            .reduce((obj, x, i) => {
                const field = this.#meta.fields[i];
                obj[field] = x;
                return obj;
            }, {} as {[k: string]: string});
    }

    findNode(ip: Uint8Array): number {
        let idx = 0;
        let node = this.#startNode;

        while (idx < this.#bitCount) {
            if (node > this.#meta.node_count) {
                break;
            }

            node = this.#readNode(node, (1 & (ip[idx >> 3] >> 7 - (idx % 8))));
            idx += 1;
        }

        if (node > this.#meta.node_count) {
            return node;
        }

        return -1;
    }

    #readNode(node: number, idx: number): number {
        return this.data.getUint32(idx * 4 + node * 8);
    }

    #ipToByte(ip: string): Uint8Array {
        const ret = new DataView(
            Uint8Array.from(
                new Array(this.#bitCount / 8).fill(0x0)
            ).buffer
        );

        if (this.#dbType === 4) {
            const arr = ip.split(".");
            arr.slice(0, -1).forEach((n, segIdx) => {
                ret.setUint8(segIdx, parseInt(n, 10));
            });
            ret.setUint8(3, parseInt(arr[arr.length - 1], 10));
        } else {
            const [start, end] = ip.trim().split("::");
            if (start) {
                start.split(":").forEach((nn, segIdx) => {
                    const [a, b, c, d] = nn.padStart(4, "0").split("");
                    ret.setUint8(segIdx * 2, parseInt(a + b, 16));
                    ret.setUint8(segIdx * 2 + 1, parseInt(c + d, 16));
                });
            }
            if (end) {
                end.split(":").reverse().forEach((nn, segIdx) => {
                    const [a, b, c, d] = nn.padStart(4, "0").split("").reverse();
                    ret.setUint8(ret.byteLength - (segIdx * 2) - 1, parseInt(a + b, 16));
                    ret.setUint8(ret.byteLength - (segIdx * 2) - 2, parseInt(c + d, 16));
                });
            }
        }

        return new Uint8Array(ret.buffer);
    }

    #resolveNode(node: number) {
        var resolved = node - this.#meta.node_count + this.#meta.node_count * 8;
        var size = this.#bytes2long(0, 0, this.data.getUint8(resolved), this.data.getUint8(resolved + 1));
        if ((resolved+2+size) > this.data.byteLength) {
            throw Error("database is error");
        }

        return this.data.buffer.slice(resolved + 2, resolved + 2 + size);
    }

    #bytes2long(a: number, b: number, c: number, d: number): number {
        return (a << 24) | (b << 16) | (c << 8) | d;
    }
}
