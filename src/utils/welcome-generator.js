const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

async function generateWelcomeImage(user) {
    try {
        // Load welcome.jpg as base
        const welcomeImagePath = path.join(__dirname, '..', '..', 'Assets', 'welcome.jpg');
        let baseImage;

        if (fs.existsSync(welcomeImagePath)) {
            baseImage = await Jimp.read(welcomeImagePath);
            baseImage.resize(800, 600);
        } else {
            // Create a solid background if welcome.jpg doesn't exist
            baseImage = new Jimp(800, 600, 0x1e3c72ff);
        }

        // Fetch user avatar
        const avatarUrl = user.displayAvatarURL({ size: 256, extension: 'png' });
        let avatarImage = await Jimp.read(avatarUrl);

        // Resize avatar to circular size
        const avatarSize = 160;
        avatarImage.resize(avatarSize, avatarSize);

        // Composite avatar onto base (simple placement, no circular mask due to Jimp limitations)
        const avatarX = (800 - avatarSize) / 2;
        const avatarY = 150;
        baseImage.composite(avatarImage, avatarX, avatarY);

        // Add white border around avatar by creating a simple border
        const borderSize = 4;
        const border = new Jimp(avatarSize + borderSize * 2, avatarSize + borderSize * 2, 0xffffffff);
        baseImage.composite(border, avatarX - borderSize, avatarY - borderSize);
        baseImage.composite(avatarImage, avatarX, avatarY);

        // Add text using Jimp font rendering
        const font = await Jimp.loadFont(Jimp.FONT_SIZE_16);

        // Draw username
        baseImage.print({
            font: font,
            x: 50,
            y: 400,
            text: user.username,
            maxWidth: 700,
        });

        // Draw welcome text
        baseImage.print({
            font: font,
            x: 50,
            y: 500,
            text: 'Welcome to the Server!',
            maxWidth: 700,
        });

        return baseImage;
    } catch (error) {
        console.error('Error generating welcome image:', error);
        return null;
    }
}

module.exports = {
    generateWelcomeImage,
};
