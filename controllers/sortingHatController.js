import crypto from 'crypto';
import User from '../models/user.js';
import House from '../models/house.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// Initialize houses in database (run once on server startup)
export const initializeHouses = async () => {
    const houses = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'];
    
    for (const houseName of houses) {
        await House.findOneAndUpdate(
            { name: houseName },
            { $setOnInsert: { name: houseName, count: 0, points: 0 } },
            { upsert: true, new: true }
        );
    }
};

// Generate deterministic score (1-10) based on name + house
const generateScore = (name, house) => {
    const input = `${name.toLowerCase()}${house.toLowerCase()}`;
    const hash = crypto.createHash('md5').update(input).digest('hex');
    
    // Convert first 8 hex chars to integer, then scale to 1-10
    const hashInt = parseInt(hash.substring(0, 8), 16);
    const score = (hashInt % 10) + 1; // Results in 1-10
    
    return score;
};

// Assign house using weighted probability based on scores and current counts
const assignHouse = async (userName) => {
    const houses = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'];
    
    // Get current house counts
    const houseDocs = await House.find({});
    const houseCounts = {};
    houseDocs.forEach(house => {
        houseCounts[house.name] = house.count;
    });

    // Generate scores for each house
    const scores = {};
    houses.forEach(house => {
        scores[house] = generateScore(userName, house);
    });

    console.log('🎲 Sorting Hat scores:', scores);
    console.log('📊 Current house counts:', houseCounts);

    // Calculate weights: (score + 1) / (houseCount + 1)
    const weights = {};
    let totalWeight = 0;
    
    houses.forEach(house => {
        const count = houseCounts[house] || 0;
        weights[house] = (scores[house] + 1) / (count + 1);
        totalWeight += weights[house];
    });

    console.log('⚖️ House weights:', weights);
    console.log('📈 Total weight:', totalWeight);

    // Create probability intervals
    const intervals = [];
    let cumulative = 0;
    
    houses.forEach(house => {
        const start = cumulative;
        const end = cumulative + weights[house];
        intervals.push({ house, start, end });
        cumulative = end;
    });

    console.log('📏 Probability intervals:', intervals);

    // Pick random number and find which interval it falls into
    const random = Math.random() * totalWeight;
    console.log('🎯 Random value:', random);

    let selectedHouse = null;
    for (const interval of intervals) {
        if (random >= interval.start && random < interval.end) {
            selectedHouse = interval.house;
            break;
        }
    }

    // Fallback (shouldn't happen, but just in case)
    if (!selectedHouse) {
        selectedHouse = intervals[intervals.length - 1].house;
    }

    console.log('🏰 Selected house:', selectedHouse);

    // Increment house count
    await House.findOneAndUpdate(
        { name: selectedHouse },
        { $inc: { count: 1 } },
        { upsert: true }
    );

    return selectedHouse;
};

// @route   POST /sorting-hat/sort
// @desc    Assign house to user after onboarding
// @access  Private (requires JWT + completed onboarding)
export const sortUser = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    
    // Check if user already has a house
    const user = await User.findById(userId);
    
    if (user.house) {
        return res.status(400).json({
            success: false,
            message: 'User has already been sorted',
            data: {
                house: user.house
            }
        });
    }

    // Check if onboarding is complete
    const isOnboardingComplete = !!(
        user.college &&
        user.batch &&
        user.gender &&
        user.contactNumber &&
        user.aadharOrCollegeId &&
        user.merchSize
    );

    if (!isOnboardingComplete) {
        return next(new AppError('Please complete onboarding before being sorted', 400));
    }

    // Assign house
    const house = await assignHouse(user.name);

    // Update user with house
    user.house = house;
    await user.save();

    console.log(`✅ User ${user.name} sorted into ${house}`);

    res.status(200).json({
        success: true,
        message: `Congratulations! You have been sorted into ${house}!`,
        data: {
            house,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                house: user.house
            }
        }
    });
});

// @route   GET /sorting-hat/stats
// @desc    Get house statistics (counts and points)
// @access  Public
export const getHouseStats = catchAsync(async (req, res, next) => {
    const houses = await House.find({}).sort({ points: -1 }); // Sort by points (highest first)
    
    const totalStudents = houses.reduce((sum, house) => sum + house.count, 0);
    const totalPoints = houses.reduce((sum, house) => sum + house.points, 0);
    
    const stats = houses.map((house, index) => ({
        rank: index + 1,
        name: house.name,
        count: house.count,
        points: house.points,
        percentage: totalStudents > 0 ? ((house.count / totalStudents) * 100).toFixed(2) : 0
    }));

    res.status(200).json({
        success: true,
        data: {
            totalStudents,
            totalPoints,
            houses: stats
        }
    });
});

// @route   GET /sorting-hat/my-house
// @desc    Get current user's house information
// @access  Private (requires JWT)
export const getMyHouse = catchAsync(async (req, res, next) => {
    const user = req.user;
    
    if (!user.house) {
        return res.status(404).json({
            success: false,
            message: 'You have not been sorted yet. Complete onboarding first.'
        });
    }

    const house = await House.findOne({ name: user.house });

    res.status(200).json({
        success: true,
        data: {
            house: {
                name: house.name,
                count: house.count,
                points: house.points
            }
        }
    });
});
