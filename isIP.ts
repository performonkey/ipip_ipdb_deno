// IPv4 Segment
export const v4Seg = '(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])';
export const v4Str = `(${v4Seg}[.]){3}${v4Seg}`;
export const IPv4Reg = new RegExp(`^${v4Str}$`);

// IPv6 Segment
export const v6Seg = '(?:[0-9a-fA-F]{1,4})';
export const IPv6Reg = new RegExp(
	'^(' +
		`(?:${v6Seg}:){7}(?:${v6Seg}|:)|` +
		`(?:${v6Seg}:){6}(?:${v4Str}|:${v6Seg}|:)|` +
		`(?:${v6Seg}:){5}(?::${v4Str}|(:${v6Seg}){1,2}|:)|` +
		`(?:${v6Seg}:){4}(?:(:${v6Seg}){0,1}:${v4Str}|(:${v6Seg}){1,3}|:)|` +
		`(?:${v6Seg}:){3}(?:(:${v6Seg}){0,2}:${v4Str}|(:${v6Seg}){1,4}|:)|` +
		`(?:${v6Seg}:){2}(?:(:${v6Seg}){0,3}:${v4Str}|(:${v6Seg}){1,5}|:)|` +
		`(?:${v6Seg}:){1}(?:(:${v6Seg}){0,4}:${v4Str}|(:${v6Seg}){1,6}|:)|` +
		`(?::((?::${v6Seg}){0,5}:${v4Str}|(?::${v6Seg}){1,7}|:))` +
		')(%[0-9a-zA-Z]{1,})?$'
);

export function isIPv4(s: string): boolean {
	return IPv4Reg.test(s);
}

export function isIPv6(s: string): boolean {
	const ip6 = (s || '').replace(/^\[/, '').replace(/\]$/, '');
	return IPv6Reg.test(ip6);
}

export function isIP(s: string): number {
	if (isIPv4(s)) return 4;
	if (isIPv6(s)) return 6;
	return 0;
}