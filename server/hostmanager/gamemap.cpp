#include "gamemap.h"

#include <unordered_set>

GameMap::GameMap(QObject *parent) : QObject(parent)
{

}

bool GameMap::generate(quint32 sideN_)
{
    // Map has to have odd length of side
    if (sideN_ % 2 == 0) {
        return false;
    }

    std::unordered_set<quint16> potentialFragileWall;
    quint16 id = 0;
    for (quint16 y = 0; y < sideN_; ++y) {
        for (quint16 x = 0; x < sideN_; ++x) {
            tiles[y][x] = MapTile();
            tiles[y][x].x = x;
            tiles[y][x].y = y;
            tiles[y][x].id = id++;

            // If both x and y are odd, there should be a wall
            if (x%2 == 1 && y%2 == 1) {
                continue;
            }
            potentialFragileWall.insert(tiles[y][x].id);
        }
    }

    // get starting player points and remove them from list of potential places for fragile walls
    auto startingAreaCoords = generateStartingAreaCoords(sideN_);
    for (auto coordPair : startingAreaCoords) {
        quint16 id = tiles[coordPair.first][coordPair.second].id;
        potentialFragileWall.erase(potentialFragileWall.find(id));
    }

    return true;
}

std::vector<std::pair<quint16, quint16> > GameMap::generateStartingAreaCoords(quint32 sideN_)
{
    //                    y        x
    std::vector<std::pair<quint16, quint16> > result;
    // left up corner
    result.push_back(std::make_pair(0, 0));
    result.push_back(std::make_pair(1, 0));
    result.push_back(std::make_pair(0, 1));

    // left down corner
    result.push_back(std::make_pair(sideN_ - 1, 0));
    result.push_back(std::make_pair(sideN_ - 1, 1));
    result.push_back(std::make_pair(sideN_, 0));

    // right up corner
    result.push_back(std::make_pair(0, sideN_ - 1));
    result.push_back(std::make_pair(0, sideN_));
    result.push_back(std::make_pair(1, sideN_ - 1));

    // right down corner
    result.push_back(std::make_pair(sideN_ - 1, sideN_ - 1));
    result.push_back(std::make_pair(sideN_ - 1, sideN_));
    result.push_back(std::make_pair(sideN_, sideN_ - 1));

    return result;
}
