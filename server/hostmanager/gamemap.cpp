#include "gamemap.h"

#include <QRandomGenerator>
#include <QJsonArray>
#include <QJsonObject>

GameMap::GameMap(QObject *parent) : QObject(parent) {}

bool GameMap::generate(quint32 sideN_)
{
    // Map has to have odd length of side
    if (sideN_ % 2 == 0) {
        return false;
    }

    if (!tiles.empty()) {
        tiles.clear();
    }

    std::unordered_set<quint16> potentialFragileWalls;
    quint16 id = 0;
    for (quint16 y = 0; y < sideN_; ++y) {
        tiles.push_back(std::vector<MapTile>());
        for (quint16 x = 0; x < sideN_; ++x) {
            tiles[y].push_back(MapTile());
            tiles[y][x].x = x;
            tiles[y][x].y = y;
            tiles[y][x].id = id++;

            // If both x and y are odd, there should be a wall
            if (x%2 == 1 && y%2 == 1) {
                continue;
            }
            potentialFragileWalls.insert(tiles[y][x].id);
        }
    }

    // get starting player points and remove them from list of potential places for fragile walls
    auto startingAreaCoords = generateStartingAreaCoords(sideN_);
    for (auto coordPair : startingAreaCoords) {
        quint16 id = tiles[coordPair.first][coordPair.second].id;
        potentialFragileWalls.erase(potentialFragileWalls.find(id));
    }

    generateFragileWalls(potentialFragileWalls);
    return true;
}

QJsonArray GameMap::dumpMap()
{
    QJsonArray map;

    for (auto row : tiles) {
        for (auto tile : row) {
            QJsonObject jsonTile;
            jsonTile.insert("id", tile.id);
            jsonTile.insert("x", tile.x);
            jsonTile.insert("y", tile.y);
            jsonTile.insert("type", "nothing");

            if (tile.type == TileType::Wall) {
                jsonTile.insert("type", "wall");
            }
            if (tile.type == TileType::FragileWall) {
                jsonTile.insert("type", "fragileWall");
            }

            map.append(jsonTile);
        }
    }

    return map;
}

std::vector<std::pair<quint16, quint16> > GameMap::generateStartingAreaCoords(quint32 sideN_)
{
    // We use sideN in calculations of coordinates so we have to decrease this number by 1 to match coordinates
    // For example bottom right corner is (8, 8) not (9, 9) for map with sideN == 9
    sideN_ -= 1;

    //                    y        x
    std::vector<std::pair<quint16, quint16> > result;
    // left top corner
    result.push_back(std::make_pair(0, 0));
    result.push_back(std::make_pair(1, 0));
    result.push_back(std::make_pair(0, 1));

    // left bottom corner
    result.push_back(std::make_pair(sideN_ - 1, 0));
    result.push_back(std::make_pair(sideN_, 0));
    result.push_back(std::make_pair(sideN_, 1));

    // right top corner
    result.push_back(std::make_pair(0, sideN_ - 1));
    result.push_back(std::make_pair(0, sideN_));
    result.push_back(std::make_pair(1, sideN_));

    // right bottom corner
    result.push_back(std::make_pair(sideN_ - 1, sideN_));
    result.push_back(std::make_pair(sideN_, sideN_ - 1));
    result.push_back(std::make_pair(sideN_, sideN_));

    return result;
}

void GameMap::generateFragileWalls(const std::unordered_set<quint16> &potentialFragileIds_)
{
    for (auto row : tiles) {
        for (auto tile : row) {
            if (potentialFragileIds_.find(tile.id) == potentialFragileIds_.end()) {
                continue;
            }
            double fragileResult = QRandomGenerator::global()->bounded(1.0);
            if (fragileResult >= FRAGILE_CHANCE) {
                continue;
            }
            tile.type = TileType::FragileWall;

            double bonusResult = QRandomGenerator::global()->bounded(1.0);

            // TODO const values add
            if (bonusResult < 0.15) {
                tile.bonus = BonusType::IncreaseBombRange;
                continue;
            }
            if (bonusResult < 0.30) {
                tile.bonus = BonusType::IncreaseBombLimit;
                continue;
            }
            if (bonusResult < 0.45) {
                tile.bonus = BonusType::DecreaseBombLimit;
                continue;
            }
            if (bonusResult < 0.6) {
                tile.bonus = BonusType::PushBomb;
                continue;
            }

        }
    }
}
