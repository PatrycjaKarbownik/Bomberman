#ifndef GAMEMAP_H
#define GAMEMAP_H

#include <QObject>

#include <vector>
#include <unordered_set>

enum TileType {
    Wall, // indestructible wall
    FragileWall, // wall that can be blown up and has a chance of bonus
    Nothing // just an empty space
};

enum BonusType {
    IncreaseBombLimit,  DecreaseBombLimit,
    IncreaseSpeed,      DecreaseSpeed,
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
    /**
     * @brief GameMap
     * @param parent
     */
    explicit GameMap(QObject *parent = nullptr);

    /**
     * @brief generate: generate a random map based on given size
     * @param sideN_: size of map (sideN_ x sideN_)
     * @return true if sideN_ is even, otherwise false (and doesn't generate a map)
     *
     * Created map has to have an odd size because it have chess-like pattern of walls in it. On even sized map
     * some walls would be side by side with map's boundaries or would be missing. In both cases that would not look
     * appealing and be possibly unfair for some players.
     * Every map has also predefined starting area for players (corners of map) and it's surroundings which have to
     * be empty. Every other tile has a FRAGILE_CHANCE for being a fragile wall.
     */
    bool generate(quint32 sideN_);

    /**
     * @brief get: Get a tile from given coordinates
     * @param x
     * @param y
     * @return Reference to a map tile
     * @throws std::out_of_range if x or y are out of range
     */
    MapTile &get(quint16 x, quint16 y);

    /**
     * @brief get: Get a tile with given id
     * @param x
     * @param y
     * @return Reference to a map tile
     * @throws std::out_of_range if there is no map tile with given id
     */
    MapTile &get(quint16 id);

    /**
     * @brief dumpMap: Dumps whole map into QJsonArray (without information about bonus under tile)
     * @return QJsonArray version of map
     */
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
        if (m_tiles.size() <= y) {
            throw std::out_of_range("Tried to access non-existent row");
        }
        return CoordProxy(&m_tiles[y]);
    }

signals:

public slots:

private:
    /**
     * @brief generateStartingAreaCoords: Generates coordinates of starting point based on map size
     * @param sideN_: size of map (like sideN_ x sideN_)
     * @return vector of pairs of y and x
     */
    static std::vector<std::pair<quint16, quint16>> generateStartingAreaCoords(quint32 sideN_);

    /**
     * @brief generateFragileWalls: Randomly sets some of the tiles into
     * @param potentialFragileIds_: Ids of walls that can be fragile
     *
     * Only some of tiles may be fragile walls (those who are not in player's spawning area or are not already walls).
     * Method below goes through all these walls and gives some chance of making it a fragile wall. It then randoms
     * next number to determine if this wall will have bonus.
     */
    void generateFragileWalls(const std::unordered_set<quint16> &potentialFragileIds_);

    // tiles[y][x]
    std::vector<std::vector<MapTile>> m_tiles;
    // Change for wall to be fragile
    const double FRAGILE_CHANCE = 0.8;
    bool m_generated = false;
};

#endif // GAMEMAP_H
