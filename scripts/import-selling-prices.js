const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const products = [
    // Condiments
    ["Condiments", "SPRING Cooking Oil - Bottle", 80.0],
    ["Condiments", "Cooking Oil - 1 bottle", 40.0],
    ["Condiments", "Cooking Oil - 1/2 bottle", 20.0],
    ["Condiments", "Red Egg", 15.0],
    ["Condiments", "White Egg", 10.0],
    ["Condiments", "Paminta", 2.0],
    ["Condiments", "Paminta durog", 3.0],
    ["Condiments", "Paminta Spicy", 3.0],
    ["Condiments", "Laurel Leaf", 4.0],
    ["Condiments", "Ajinomoto Vetchin - 11g", 5.0],
    ["Condiments", "Ajinomoto Vetchin - 24g", 8.0],
    ["Condiments", "Ajinomoto Ginisa", 6.0],
    ["Condiments", "Maggi Magic Sarap", 7.0],
    ["Condiments", "Oyster Sauce - sachet - small", 10.0],
    ["Condiments", "Knorr Cubes - chicken, pork", 10.0],
    ["Condiments", "Asin", 10.0],
    ["Condiments", "BIGAS - 1 KL.", 63.0],
    ["Condiments", "Datu Puti Suka - Pouch - 100ml", 8.0],
    ["Condiments", "Datu Puti Suka - Pouch - 200ml", 12.0],
    ["Condiments", "Datu Puti Suka - Pouch - 325ml", 20.0],
    ["Condiments", "Datu Puti Suka - Bottle Plastic", 25.0],
    ["Condiments", "Silver Swan Suka - 100 ml", 8.0],
    ["Condiments", "Silver Swan Suka - 200 ml", 12.0],
    ["Condiments", "Silver Swan Suka - Bottle Plastic", 25.0],
    ["Condiments", "Datu Puti Toyo - Pouch - 100ml", 15.0],
    ["Condiments", "Datu Puti Toyo - Pouch - 200ml", 20.0],
    ["Condiments", "Datu Puti Toyo - Bottle Plastic", 28.0],
    ["Condiments", "Silver Swan Toyo - Pouch - 100ml", 15.0],
    ["Condiments", "Silver Swan Toyo - Pouch - 200ml", 20.0],
    ["Condiments", "Silver Swan Toyo - Bottle Plastic", 28.0],
    ["Condiments", "Select Soy Sauce - bottle", 25.0],
    ["Condiments", "Lorins Patis Sachet - 150 ml", 18.0],
    ["Condiments", "Nelicom Patis Bottle", 35.0],
    ["Condiments", "JUFRAN Ketchup Bottle", 42.0],
    ["Condiments", "UFC Ketchup Sachet", 18.0],
    ["Condiments", "UFC Ketchup Bottle", 35.0],
    ["Condiments", "Papa Ketchup Sachet", 15.0],
    ["Condiments", "Papa Ketchup Small Bottle", 32.0],
    ["Condiments", "Papa Ketchup Big Bottle", 50.0],
    ["Condiments", "Papa Ketchup Big Plastic", 75.0],
    ["Condiments", "Mang Tomas Sachet", 15.0],
    ["Condiments", "Mang Tomas - 1 bottle", 42.0],
    ["Condiments", "Mang Tomas - Big Bottle", 55.0],
    ["Condiments", "CHEESEWIZ - sachet", 20.0],
    ["Condiments", "Mayonaise - sachet", 20.0],
    ["Condiments", "Reno Liver Spread", 30.0],
    ["Condiments", "Del Monte Tid Bits - 115g", 22.0],
    ["Condiments", "Ram Tomato Sauce", 25.0],
    ["Condiments", "Del Monte Tomato Sauce", 25.0],
    ["Condiments", "Delmonte Tomato Paste", 25.0],
    ["Condiments", "Bagoong Lingayen - plastic bottle", 25.0],
    ["Condiments", "Bagoong bottle", 30.0],

    // Noodles & Canned Goods
    ["Noodles & Canned Goods", "Noodles Regular", 10.0],
    ["Noodles & Canned Goods", "Noodles Beef Sachet", 10.0],
    ["Noodles & Canned Goods", "Lucky me Noodles - Itnok", 12.0],
    ["Noodles & Canned Goods", "Lucky me Canton Original", 18.0],
    ["Noodles & Canned Goods", "Lucky me Chilimansi", 18.0],
    ["Noodles & Canned Goods", "Lucky Me Kalamnsi", 18.0],
    ["Noodles & Canned Goods", "LUCKY ME Canton BIG", 23.0],
    ["Noodles & Canned Goods", "Homi Beef Noodles", 10.0],
    ["Noodles & Canned Goods", "Nissin Ramen - Seafood", 17.0],
    ["Noodles & Canned Goods", "Nissin Ramen Noodles Spicy", 18.0],
    ["Noodles & Canned Goods", "Nissin Noodles Beef", 14.0],
    ["Noodles & Canned Goods", "Lucky Me Sotanghon - Cup Noodles", 30.0],
    ["Noodles & Canned Goods", "Lucky Me Chicken - Cup Noodles", 30.0],
    ["Noodles & Canned Goods", "Lucky Me Bulalo - Cup Noodles", 30.0],
    ["Noodles & Canned Goods", "Nissin - 50G - Cup Noodles", 30.0],
    ["Noodles & Canned Goods", "Nissin Spicy - 40G - Cup Noodles", 30.0],
    ["Noodles & Canned Goods", "Nissin Bachoy - 40G - Cup Noodles", 30.0],
    ["Noodles & Canned Goods", "Nissin Chicken - 40G - Cup Noodles", 30.0],
    ["Noodles & Canned Goods", "Nissin - Cup Noodles", 30.0],
    ["Noodles & Canned Goods", "Sardines Green", 28.0],
    ["Noodles & Canned Goods", "Sardines Red", 28.0],
    ["Noodles & Canned Goods", "Century Tuna", 42.0],
    ["Noodles & Canned Goods", "Fresca Tuna", 35.0],
    ["Noodles & Canned Goods", "Argentina Meat Loaf", 35.0],
    ["Noodles & Canned Goods", "Argentina Corned Beef", 35.0],
    ["Noodles & Canned Goods", "Argentina - 150g", 40.0],
    ["Noodles & Canned Goods", "San Marino Tuna - 85g", 32.0],
    ["Noodles & Canned Goods", "San Marino Tuna Chili - 85g", 32.0],
    ["Noodles & Canned Goods", "PUREFOODS Luncheon Meat", 110.0],
    ["Noodles & Canned Goods", "PUREFOODS Corned Beef", 100.0],
    ["Noodles & Canned Goods", "Crispyfry small", 22.0],
    ["Noodles & Canned Goods", "Crispyfry big", 75.0],
    ["Noodles & Canned Goods", "Ram Taosi", 20.0],

    // Biscuits & Chichiria
    ["Biscuits & Chichiria", "Pringles", 100.0],
    ["Biscuits & Chichiria", "SkyFlakes", 8.0],
    ["Biscuits & Chichiria", "Fita", 9.0],
    ["Biscuits & Chichiria", "Butter Coconut", 9.0],
    ["Biscuits & Chichiria", "Hansel", 10.0],
    ["Biscuits & Chichiria", "Rebisco", 10.0],
    ["Biscuits & Chichiria", "Bingo Chocolate Biscuit", 10.0],
    ["Biscuits & Chichiria", "Presto", 10.0],
    ["Biscuits & Chichiria", "Nissin Wafer", 10.0],
    ["Biscuits & Chichiria", "Wafrets Choco Bar", 10.0],
    ["Biscuits & Chichiria", "Wafrets Cheese Bar", 10.0],
    ["Biscuits & Chichiria", "Wafer Time", 11.0],
    ["Biscuits & Chichiria", "Wafelo", 11.0],
    ["Biscuits & Chichiria", "Oreo", 11.0],
    ["Biscuits & Chichiria", "Cream-O", 11.0],
    ["Biscuits & Chichiria", "Brownie Scotch", 6.0],
    ["Biscuits & Chichiria", "Choco Mucho", 7.0],
    ["Biscuits & Chichiria", "Inipit", 10.0],
    ["Biscuits & Chichiria", "Richees", 11.0],
    ["Biscuits & Chichiria", "Cal Cheese", 11.0],
    ["Biscuits & Chichiria", "Lava Cake", 11.0],
    ["Biscuits & Chichiria", "Fudgee Bar", 12.0],
    ["Biscuits & Chichiria", "Super Delight", 12.0],
    ["Biscuits & Chichiria", "Whata Tops", 12.0],
    ["Biscuits & Chichiria", "Quake", 12.0],
    ["Biscuits & Chichiria", "Overload", 12.0],
    ["Biscuits & Chichiria", "Chochoo", 12.0],
    ["Biscuits & Chichiria", "Nissin BreadStix", 10.0],
    ["Biscuits & Chichiria", "Nissin Eggnog", 10.0],
    ["Biscuits & Chichiria", "Nissin Eggnog - 35g", 15.0],
    ["Biscuits & Chichiria", "YumYum", 23.0],
    ["Biscuits & Chichiria", "Ponky Stick - Carton", 35.0],
    ["Biscuits & Chichiria", "Chueby Chocolate", 2.0],
    ["Biscuits & Chichiria", "Puff Choco Mallows", 2.0],
    ["Biscuits & Chichiria", "WIGGLES", 4.0],
    ["Biscuits & Chichiria", "NIPS Chocolate", 6.0],
    ["Biscuits & Chichiria", "Cloud Nine Chocolate - Mini Bars", 4.0],
    ["Biscuits & Chichiria", "Cloud Nine Chocolate - Big", 12.0],
    ["Biscuits & Chichiria", "BengBeng Chocolate", 12.0],
    ["Biscuits & Chichiria", "Goya Dark Chocolate", 30.0],
    ["Biscuits & Chichiria", "Goya Milk Chocolate", 30.0],
    ["Biscuits & Chichiria", "Goya Cream Bar", 30.0],
    ["Biscuits & Chichiria", "Super Stix", 2.0],
    ["Biscuits & Chichiria", "Stick-O", 2.0],
    ["Biscuits & Chichiria", "Tempura", 10.0],
    ["Biscuits & Chichiria", "Chippy Small", 10.0],
    ["Biscuits & Chichiria", "Moby", 10.0],
    ["Biscuits & Chichiria", "Peewee", 10.0],
    ["Biscuits & Chichiria", "Cheezit", 10.0],
    ["Biscuits & Chichiria", "Ri-chee", 10.0],
    ["Biscuits & Chichiria", "Mang Juan Small", 10.0],
    ["Biscuits & Chichiria", "Potatofries", 10.0],
    ["Biscuits & Chichiria", "Mang Juan Big", 30.0],
    ["Biscuits & Chichiria", "Piatos", 20.0],
    ["Biscuits & Chichiria", "Nova", 20.0],
    ["Biscuits & Chichiria", "Pillows", 12.0],
    ["Biscuits & Chichiria", "Cheez It", 10.0],
    ["Biscuits & Chichiria", "Loaded", 10.0],
    ["Biscuits & Chichiria", "Martys", 10.0],
    ["Biscuits & Chichiria", "Oishi", 10.0],
    ["Biscuits & Chichiria", "Crispy Patata", 10.0],
    ["Biscuits & Chichiria", "CLOVER", 10.0],
    ["Biscuits & Chichiria", "SUPER CRUNCH - 55G", 12.0],
    ["Biscuits & Chichiria", "Corn Bits", 15.0],
    ["Biscuits & Chichiria", "Corn Bits - 70G", 20.0],
    ["Biscuits & Chichiria", "Happy Peanut (3 for 5)", 1.67],
    ["Biscuits & Chichiria", "Dingdong small (3 for 5)", 1.67],
    ["Biscuits & Chichiria", "Dingdong big", 28.0],
    ["Biscuits & Chichiria", "WL Tattoos - inside the plastic - 10pcs", 3.0],
    ["Biscuits & Chichiria", "WL ZYSTYCHIP", 3.0],
    ["Biscuits & Chichiria", "WL Super Bawang - 22g", 5.0],
    ["Biscuits & Chichiria", "Boy Bawang", 10.0],
    ["Biscuits & Chichiria", "Peanuttsu", 15.0],
    ["Biscuits & Chichiria", "Honey Butter Chips", 20.0],
    ["Biscuits & Chichiria", "Hi-Ho big", 40.0],
    ["Biscuits & Chichiria", "Pick A big", 42.0],
    ["Biscuits & Chichiria", "LION Cheese Bone", 15.0],

    // Candies
    ["Candies", "V-Fresh", 1.5],
    ["Candies", "White Rabbit (4 for 5)", 1.25],
    ["Candies", "Kendi Mint (4 for 5)", 1.25],
    ["Candies", "XO (4 for 5)", 1.25],
    ["Candies", "Max Dalandan (4 for 5)", 1.25],
    ["Candies", "Max Lemon (4 for 5)", 1.25],
    ["Candies", "Frutos (4 for 5)", 1.25],
    ["Candies", "Dynamite (4 for 5)", 1.25],
    ["Candies", "Kopiko (4 for 5)", 1.25],
    ["Candies", "Fresh Mint (4 for 5)", 1.25],
    ["Candies", "Frooty Lollipop", 2.5],
    ["Candies", "Jelly Ace", 2.5],
    ["Candies", "Jelly Ace - Ice Candy", 8.0]
];

async function main() {
    const seen = new Set();
    let created = 0;
    let updated = 0;

    for (const [category, name, sellPrice] of products) {
        const key = `${category}::${name}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);

        const existing = await prisma.product.findFirst({
            where: { category, name }
        });

        if (existing) {
            await prisma.product.update({
                where: { id: existing.id },
                data: { sellPrice }
            });
            updated += 1;
        } else {
            await prisma.product.create({
                data: {
                    category,
                    name,
                    sellPrice,
                    costPrice: sellPrice,
                    stock: 0
                }
            });
            created += 1;
        }
    }

    console.log(`Done. Created: ${created}, Updated: ${updated}, Total input: ${seen.size}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async() => {
        await prisma.$disconnect();
    });