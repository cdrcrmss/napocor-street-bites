const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categoryHeaders = new Set([
    "Condiments & Pantry Staples",
    "Noodles & Canned Goods",
    "Biscuits & Chichiria",
    "Candies"
]);

const rawCatalog = String.raw `
Condiments & Pantry Staples
Item,SRP
SPRING Cooking Oil - Bottle,80.00
Cooking Oil - 1 bottle,40.00
Cooking Oil - 1/2 bottle,20.00
Red Egg,15.00
White Egg,10.00
Paminta,2.00
Paminta durog,3.00
Paminta Spicy,3.00
Laurel Leaf,4.00
Ajinomoto Vetchin - 11g,5.00
Ajinomoto Vetchin - 24g,8.00
Ajinomoto Ginisa,6.00
Maggi Magic Sarap,7.00
Oyster Sauce - sachet - small,10.00
"Knorr Cubes - chicken, pork",10.00
Asin,10.00
BIGAS - 1 KL.,63.00
Datu Puti Suka - Pouch - 100ml,8.00
Datu Puti Suka - Pouch - 200ml,12.00
Datu Puti Suka - Pouch - 325ml,20.00
Datu Puti Suka - Bottle Plastic,25.00
Silver Swan Suka - 100ml,8.00
Silver Swan Suka - 200ml,12.00
Silver Swan Suka - Bottle Plastic,25.00
Datu Puti Toyo - Pouch - 100ml,15.00
Datu Puti Toyo - Pouch - 200ml,20.00
Datu Puti Toyo - Bottle Plastic,28.00
Silver Swan Toyo - Pouch - 100ml,15.00
Silver Swan Toyo - Pouch - 200ml,20.00
Silver Swan Toyo - Bottle Plastic,28.00
Select Soy Sauce - bottle,25.00
Lorins Patis Sachet - 150 ml,18.00
Nelicom Patis Bottle,35.00
JUFRAN Ketchup Bottle,42.00
UFC Ketchup Sachet,18.00
UFC Ketchup Bottle,35.00
Papa Ketchup Sachet,15.00
Papa Ketchup Small Bottle,32.00
Papa Ketchup Big Bottle,50.00
Papa Ketchup Big Plastic,75.00
Mang Tomas Sachet,15.00
Mang Tomas - 1 bottle,42.00
Mang Tomas - Big Bottle,55.00
CHEESEWIZ - sachet,20.00
Mayonaise - sachet,20.00
Reno Liver Spread,30.00
Del Monte Tid Bits - 115g,22.00
Ram Tomato Sauce,25.00
Del Monte Tomato Sauce,25.00
Delmonte Tomato Paste,25.00
Bagoong Lingayen - plastic bottle,25.00
Bagoong bottle,30.00
Silver Swan Toyo - Pouch - 100ml,15.00
Silver Swan Toyo - Pouch - 200ml,20.00
Silver Swan Toyo - Bottle Plastic,28.00

Noodles & Canned Goods
Item,SRP
Noodles Regular,10.00
Noodles Beef Sachet,10.00
Lucky me Noodles - Itnok,12.00
Lucky me Canton Original,18.00
Lucky me Chilimansi,18.00
Lucky Me Kalamansi,18.00
LUCKY ME Canton BIG,23.00
Homi Beef Noodles,10.00
Nissin Ramen - Seafood,17.00
Nissin Ramen Noodles Spicy,18.00
Nissin Noodles Beef,14.00
Lucky Me Sotanghon - Cup Noodles,30.00
Lucky Me Chicken - Cup Noodles,30.00
Lucky Me Bulalo - Cup Noodles,30.00
Nissin - 50G - Cup Noodles,30.00
Nissin - 50G - Cup Noodles (Repeated),30.00
Nissin Spicy - 40G - Cup Noodles,30.00
Nissin Bachoy - 40G - Cup Noodles,30.00
Nissin Chicken - 40G - Cup Noodles,30.00
Nissin - Cup Noodles,30.00
Sardines Green,28.00
Sardines Red,28.00
Century Tuna,42.00
Fresca Tuna,35.00
Argentina Meat Loaf,35.00
Argentina Corned Beef,35.00
Argentina - 150g,40.00
San Marino Tuna - 85g,32.00
San Marino Tuna Chili - 85g,32.00
San Marino Tuna Chili - 85g (Repeated),32.00
PUREFOODS Luncheon Meat,110.00
PUREFOODS Corned Beef,100.00
Crispyfry small,22.00
Crispyfry big,75.00
Ram Taosi,20.00

Biscuits & Chichiria
Item,SRP
Pringles,100.00
Skyflakes,8.00
Fita,9.00
Butter Coconut,9.00
Hansel,10.00
Rebisco,10.00
Bingo Chocolate Biscuit,10.00
Presto,10.00
Nissin Wafer,10.00
Wafrets Choco Bar,10.00
Wafrets Cheese Bar,10.00
Wafer Time,11.00
Wafelo,11.00
Oreo,11.00
Cream-O,11.00
Brownie Scotch,6.00
Choco Mucho,7.00
Inipit,10.00
Richees,11.00
Cal Cheese,11.00
Lava Cake,11.00
Fudgee Bar,12.00
Super Delight,12.00
Whata Tops,12.00
Quake,12.00
Overload,12.00
Chochoo,12.00
Nissin BreadStix,10.00
Nissin Eggnog,10.00
Nissin Eggnog - 35g,15.00
YumYum,23.00
Ponky Stick - Carton,35.00
Chueby Chocolate,2.00
Puff Choco Mallows,2.00
WIGGLES,4.00
NIPS Chocolate,6.00
Cloud Nine Chocolate - Mini Bars,4.00
Cloud Nine Chocolate - Big,12.00
BengBeng Chocolate,12.00
Goya Dark Chocolate,30.00
Goya Milk Chocolate,30.00
Goya Cream Bar,30.00
Super Stix,2.00
Stick-O,2.00
Tempura,10.00
Chippy Small,10.00
Chippy Big,10.00
Moby,10.00
Peewee,10.00
Cheezit,10.00
Ri-chee,10.00
Mang Juan Small,10.00
Potatofries,10.00
Mang Juan Big,30.00
Piattos,20.00
Nova,20.00
Pillows,12.00
Loaded,10.00
Martys,10.00
Oishi,10.00
Crkspy Patata,10.00
CLOVER,10.00
SUPER CRUNCH - 55G,12.00
Corn Bits,15.00
Corn Bits - 70G,20.00
Happy Peanut,3 for 5.00
Dingdong small,3 for 5.00
Dingdong big,28.00
WL Tattoos - inside the plastic - 10pcs,3.00
WL ZYSTYCHIP,3.00
WL Super Bawang - 22g,5.00
Boy Bawang,10.00
Peanuttsu,15.00
Honey Butter Chips,20.00
Hi-Ho big,40.00
Pick A big,42.00
LION Cheese Bone,15.00
Cheez It (repeated at bottom of list),10.00
Mang Juan Small (repeated entry),10.00

Candies
Item,SRP
V-Fresh,1.50
White Rabbit,4 for 5.00
Kendi Mint,4 for 5.00
XO,4 for 5.00
Max Dalandan,4 for 5.00
Max Lemon,4 for 5.00
Frutos,4 for 5.00
Dynamite,4 for 5.00
Kopiko,4 for 5.00
Fresh Mint,4 for 5.00
Frooty Lollipop,2.50
Jelly Ace,2.50
Jelly Ace - Ice Candy,8.00
`;

function normalizeName(name) {
    return String(name || "")
        .replace(/^"|"$/g, "")
        .replace(/\s+\(Repeated\)$/i, "")
        .replace(/\s+\(repeated at bottom of list\)$/i, "")
        .replace(/\s+\(repeated entry\)$/i, "")
        .trim();
}

function parseCatalogLine(line) {
    if (line.startsWith('"')) {
        const quoteEnd = line.indexOf('",');
        if (quoteEnd > 0) {
            const name = line.slice(1, quoteEnd);
            const srp = line.slice(quoteEnd + 2).trim();
            return { name, srp };
        }
    }

    const idx = line.lastIndexOf(",");
    if (idx <= 0) {
        return null;
    }

    const name = line.slice(0, idx).trim();
    const srp = line.slice(idx + 1).trim();
    return { name, srp };
}

function parseSrpValue(name, rawSrp) {
    const srp = String(rawSrp || "").trim();
    const bundleMatch = srp.match(/^(\d+(?:\.\d+)?)\s*for\s*(\d+(?:\.\d+)?)$/i);

    if (bundleMatch) {
        const quantity = bundleMatch[1];
        const totalPrice = Number(bundleMatch[2]);
        const withBundleName = /\bfor\b/i.test(name) ? name : `${name} - ${quantity} for ${bundleMatch[2]}`;
        return { name: withBundleName, sellPrice: totalPrice };
    }

    const numeric = Number(srp);
    if (!Number.isFinite(numeric)) {
        return null;
    }

    return { name, sellPrice: numeric };
}

function toLooseKey(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function parseProductsFromCatalog(text) {
    const lines = String(text || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const products = [];
    let currentCategory = null;

    for (const line of lines) {
        if (categoryHeaders.has(line)) {
            currentCategory = line;
            continue;
        }

        if (/^Item\s*,\s*SRP$/i.test(line)) {
            continue;
        }

        if (!currentCategory) {
            continue;
        }

        const parsedLine = parseCatalogLine(line);
        if (!parsedLine) {
            continue;
        }

        const parsedPrice = parseSrpValue(normalizeName(parsedLine.name), parsedLine.srp);
        if (!parsedPrice) {
            continue;
        }

        products.push({
            category: currentCategory,
            name: normalizeName(parsedPrice.name),
            sellPrice: parsedPrice.sellPrice
        });
    }

    return products;
}

const products = parseProductsFromCatalog(rawCatalog);

async function cleanupLegacyRows() {
    const legacyRows = [{
            oldCategory: "Condiments",
            oldName: "Silver Swan Suka - 100 ml",
            newCategory: "Condiments & Pantry Staples",
            newName: "Silver Swan Suka - 100ml"
        },
        {
            oldCategory: "Condiments",
            oldName: "Silver Swan Suka - 200 ml",
            newCategory: "Condiments & Pantry Staples",
            newName: "Silver Swan Suka - 200ml"
        }
    ];

    let cleaned = 0;

    for (const row of legacyRows) {
        const legacy = await prisma.product.findFirst({
            where: {
                category: { equals: row.oldCategory, mode: "insensitive" },
                name: { equals: row.oldName, mode: "insensitive" }
            }
        });

        if (!legacy) {
            continue;
        }

        const canonical = await prisma.product.findFirst({
            where: {
                category: { equals: row.newCategory, mode: "insensitive" },
                name: { equals: row.newName, mode: "insensitive" }
            }
        });

        if (canonical) {
            await prisma.product.update({
                where: { id: canonical.id },
                data: {
                    stock: canonical.stock + legacy.stock
                }
            });

            await prisma.product.delete({
                where: { id: legacy.id }
            });
        } else {
            await prisma.product.update({
                where: { id: legacy.id },
                data: {
                    category: row.newCategory,
                    name: row.newName,
                    costPrice: 0
                }
            });
        }

        cleaned += 1;
    }

    return cleaned;
}

async function main() {
    const seen = new Set();
    let duplicateInput = 0;
    let created = 0;
    let updated = 0;

    for (const product of products) {
        const category = product.category;
        const name = product.name;
        const sellPrice = product.sellPrice;

        const key = `${category.toLowerCase()}::${name.toLowerCase()}`;
        if (seen.has(key)) {
            duplicateInput += 1;
            continue;
        }
        seen.add(key);

        let existing = await prisma.product.findFirst({
            where: {
                category: { equals: category, mode: "insensitive" },
                name: { equals: name, mode: "insensitive" }
            }
        });

        if (!existing) {
            existing = await prisma.product.findFirst({
                where: {
                    name: { equals: name, mode: "insensitive" }
                }
            });
        }

        if (!existing) {
            const looseName = toLooseKey(name);
            const sameCategory = await prisma.product.findMany({
                where: {
                    category: { equals: category, mode: "insensitive" }
                },
                select: {
                    id: true,
                    name: true
                }
            });

            existing = sameCategory.find((item) => toLooseKey(item.name) === looseName) || null;
        }

        if (!existing) {
            const looseName = toLooseKey(name);
            const anyCategory = await prisma.product.findMany({
                select: {
                    id: true,
                    name: true
                }
            });

            existing = anyCategory.find((item) => toLooseKey(item.name) === looseName) || null;
        }

        if (existing) {
            await prisma.product.update({
                where: { id: existing.id },
                data: {
                    category,
                    name,
                    sellPrice,
                    // Product.costPrice is required by schema; use 0 as blank placeholder.
                    costPrice: 0
                }
            });
            updated += 1;
        } else {
            await prisma.product.create({
                data: {
                    category,
                    name,
                    sellPrice,
                    // Product.costPrice is required by schema; use 0 as blank placeholder.
                    costPrice: 0,
                    stock: 0
                }
            });
            created += 1;
        }
    }

    const cleaned = await cleanupLegacyRows();

    console.log(
        `Done. Created: ${created}, Updated: ${updated}, Unique input: ${seen.size}, Duplicates skipped: ${duplicateInput}, Legacy cleaned: ${cleaned}`
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async() => {
        await prisma.$disconnect();
    });