#include "testgamemap.h"

void TestGameMap::indexOperatorWorks()
{
    GameMap map;
    QVERIFY(map.generate(9));

    // Check if out-of-index results in just default value for element
    QVERIFY_EXCEPTION_THROWN(map[10][20], std::out_of_range);
    QVERIFY_EXCEPTION_THROWN(map[1][123], std::out_of_range);
    QVERIFY_EXCEPTION_THROWN(map[123][3], std::out_of_range);

    map[3][4].x = 14414;
    QCOMPARE(map[3][4].x, 14414);

}

void TestGameMap::indexOperatorWorksProperly()
{
    GameMap map;
    QVERIFY(map.generate(13));

    for (quint16 y = 0; y < 13; ++y) {
        for (quint16 x = 0; x < 13; ++x) {
            QCOMPARE(map[y][x].x, x);
            QCOMPARE(map[y][x].y, y);
        }
    }
}

void TestGameMap::jsonDumpsProperly()
{
    const quint16 MapSize = 11;
    GameMap map;
    QVERIFY(map.generate(MapSize));
    QJsonArray jsonMap = map.dumpMap();

    QCOMPARE(jsonMap.size(), MapSize*MapSize);

    // Try to recreate map from json

    // Generate map of bools to check every position
    std::vector<std::vector<bool>> mapOfChecked;
    for (quint16 y = 0; y < MapSize; ++y) {
        mapOfChecked.push_back(std::vector<bool>());

        for (quint16 x = 0; x < MapSize; ++x) {
            mapOfChecked[y].push_back(false);
        }
    }

    std::unordered_set<quint16> usedIds; // Check if IDs are unique
    for (const QJsonValue jsonTile : jsonMap) {
        QCOMPARE(jsonTile["x"].isDouble(), true);
        QCOMPARE(jsonTile["y"].isDouble(), true);
        QCOMPARE(jsonTile["id"].isDouble(), true);
        QCOMPARE(jsonTile["type"].isString(), true);

        auto x = static_cast<quint16>(jsonTile["x"].toInt());
        auto y = static_cast<quint16>(jsonTile["y"].toInt());
        auto id = static_cast<quint16>(jsonTile["id"].toInt());

        QCOMPARE(mapOfChecked[y][x], false);
        QCOMPARE(usedIds.find(id), usedIds.end());
        mapOfChecked[y][x] = true;
        usedIds.insert(id);

        QString type = jsonTile["type"].toString();
        QCOMPARE(type.compare("wall") || type.compare("fragileWall") || type.compare("nothing"), true);
    }

}
