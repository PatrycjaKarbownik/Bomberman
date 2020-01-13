#ifndef GAMEMAP_H
#define GAMEMAP_H

#include <QObject>

#include <vector>
#include <unordered_set>

enum TileType {
    Wall, FragileWall, Nothing
};

enum BonusType {
    IncreaseBombLimit,  DecreaseBombLimit,
    PushBomb,           IncreaseBombRange,
    None
};

struct MapTile {
    quint16 id {0};
    quint16 x {0};
    quint16 y {0};
    TileType type = TileType::Nothing;
    BonusType bonus = BonusType::None;
};

/**
 * @brief The GameMap class
 */
class GameMap : public QObject
{
    Q_OBJECT
public:
    explicit GameMap(QObject *parent = nullptr);
    bool generate(quint32 sideN_);
    MapTile &get(quint16 x, quint16 y);
    MapTile &get(quint16 id);
    QJsonArray dumpMap();

    // NOTE For the sake of completness I just keep both CoordProxy and GameMap's [] operator as a code in same place
    // TODO Keep CoordProxy or not? How to secure it?
    class CoordProxy {
    public:
        CoordProxy(std::vector<MapTile>* mapRow) : m_mapRow(mapRow) {}

        MapTile& operator[](quint16 x) {
            // It propbably would not be necessary to throw but to be consistent it'll throw also here
            if (m_mapRow->size() <= x) {
                throw std::out_of_range("Tried to access non-existent row");
            }
            return (*m_mapRow)[x];
        }

    private:
        std::vector<MapTile> *m_mapRow;
    };

    CoordProxy operator[](quint16 y) {
        // NOTE I have no better idea to secure this than to throw out of range
        if (tiles.size() <= y) {
            throw std::out_of_range("Tried to access non-existent row");
        }
        return CoordProxy(&tiles[y]);
    }

signals:

public slots:

private:
    static std::vector<std::pair<quint16, quint16>> generateStartingAreaCoords(quint32 sideN_);
    void generateFragileWalls(const std::unordered_set<quint16> &potentialFragileIds_);

    // tiles[y][x]
    std::vector<std::vector<MapTile>> tiles;
    // Change for wall to be fragile
    const double FRAGILE_CHANCE = 0.8;
    bool m_generated = false;
};

#endif // GAMEMAP_H
